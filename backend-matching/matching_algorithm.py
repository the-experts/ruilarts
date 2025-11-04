#!/usr/bin/env python3
"""
Circular Matching Algorithm for Huisarts Practice Swaps

Detects circular matches (swap cycles) where multiple people can exchange
huisarts practices simultaneously.
"""

import csv
from collections import defaultdict
from typing import List, Dict, Set, Tuple


def load_people_data(csv_file: str) -> List[Dict]:
    """Load people data from CSV file."""
    people = []
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            people.append(row)
    return people


def build_graph(people: List[Dict], preference_level: int = 1) -> Dict[str, Dict]:
    """
    Build a directed graph where each person points to their desired huisarts.

    Args:
        people: List of person dictionaries
        preference_level: Which preference to use (1 = first choice, 2 = second choice)

    Returns a mapping of: current_huisarts -> {person_data, desired_huisarts, preference}
    """
    graph = {}

    for person in people:
        current = person['current_huisarts']

        # Select the desired huisarts based on preference level
        if preference_level == 1:
            desired = person.get('desired_huisarts', '')
        elif preference_level == 2:
            desired = person.get('desired_huisarts_2', '')
        else:
            desired = ''

        # Only add to graph if desired practice exists
        if desired:
            graph[current] = {
                'person': person,
                'next': desired,
                'preference': preference_level
            }

    return graph


def find_all_cycles(graph: Dict[str, Dict]) -> List[List[str]]:
    """
    Find all simple cycles in the graph.

    Returns a list of cycles, where each cycle is a list of practice names.
    """
    all_cycles = []

    def dfs_all_cycles(start: str, current: str, path: List[str], visited: Set[str]) -> None:
        """DFS to find all cycles starting from 'start'."""
        if current == start and len(path) > 0:
            # Found a cycle back to start
            all_cycles.append(path[:])
            return

        if current in visited:
            return

        if current not in graph:
            return

        visited.add(current)
        path.append(current)

        next_practice = graph[current]['next']
        dfs_all_cycles(start, next_practice, path, visited)

        path.pop()
        visited.remove(current)

    # Try each practice as a potential cycle start
    for practice in graph.keys():
        dfs_all_cycles(practice, practice, [], set())

    # Remove duplicates (same cycle starting from different points)
    unique_cycles = []
    seen_sets = []

    for cycle in all_cycles:
        cycle_set = frozenset(cycle)
        if cycle_set not in seen_sets:
            seen_sets.append(cycle_set)
            unique_cycles.append(cycle)

    return unique_cycles


def select_optimal_cycles(all_cycles: List[List[str]], graph: Dict[str, Dict]) -> Tuple[List[List[Dict]], Set[str]]:
    """
    Select the optimal set of non-overlapping cycles.

    Strategy: Prioritize smaller circles to minimize points of failure,
    while maximizing the total number of people matched.

    Returns:
        - List of selected cycles (as person dictionaries)
        - Set of practices in selected cycles
    """
    # Sort cycles by size (smallest first)
    sorted_cycles = sorted(all_cycles, key=len)

    selected_cycles = []
    used_practices = set()

    # Greedily select cycles that don't overlap
    for cycle in sorted_cycles:
        # Check if this cycle overlaps with already selected ones
        if not any(practice in used_practices for practice in cycle):
            selected_cycles.append(cycle)
            used_practices.update(cycle)

    # Convert practice names to person data
    cycles_with_people = []
    for cycle in selected_cycles:
        cycle_people = []
        for practice in cycle:
            if practice in graph:
                cycle_people.append(graph[practice]['person'])
        if cycle_people:
            cycles_with_people.append(cycle_people)

    return cycles_with_people, used_practices


def find_cycles(graph: Dict[str, Dict]) -> Tuple[List[List[Dict]], Set[str]]:
    """
    Find optimal cycles prioritizing smaller circles.

    Returns:
        - List of cycles, where each cycle is a list of person dictionaries
        - Set of huisarts practices that are part of any cycle
    """
    all_cycles = find_all_cycles(graph)
    return select_optimal_cycles(all_cycles, graph)


def find_unmatched(people: List[Dict], practices_in_cycles: Set[str]) -> List[Dict]:
    """Find people who are not part of any cycle."""
    unmatched = []

    for person in people:
        current = person['current_huisarts']
        if current not in practices_in_cycles:
            unmatched.append(person)

    return unmatched


def print_results(cycles: List[List[Dict]], unmatched: List[Dict]) -> None:
    """Print the matching results in a readable format."""
    print("=" * 80)
    print("CIRCULAR MATCHING RESULTS")
    print("=" * 80)
    print()

    # Print cycles
    if cycles:
        print(f"✓ Found {len(cycles)} circular match(es):\n")

        for i, cycle in enumerate(cycles, 1):
            print(f"Circle {i}: {len(cycle)} people")
            print("-" * 40)

            for j, person in enumerate(cycle):
                next_person = cycle[(j + 1) % len(cycle)]
                print(f"  {person['name']} ({person['current_location']})")
                print(f"    Currently at: {person['current_huisarts']}")
                print(f"    Wants: {person['desired_huisarts']} in {person['new_location']}")
                print(f"    → Gets spot from: {next_person['name']}")
                print()

            # Show the circular path
            names = [p['name'].split()[0] for p in cycle]  # First names only
            circular_path = " → ".join(names) + f" → {names[0]}"
            print(f"  Swap chain: {circular_path}")
            print()
    else:
        print("✗ No circular matches found.")
        print()

    # Print unmatched people
    if unmatched:
        print(f"⚠ {len(unmatched)} person(s) without a match:")
        print("-" * 40)

        for person in unmatched:
            print(f"  {person['name']} ({person['current_location']})")
            print(f"    Currently at: {person['current_huisarts']}")
            print(f"    Wants: {person['desired_huisarts']} in {person['new_location']}")
            print(f"    Reason: No one at desired practice wants to leave")
            print()
    else:
        print("✓ Everyone is matched!")
        print()

    # Summary statistics
    total_matched = sum(len(cycle) for cycle in cycles)
    total_people = total_matched + len(unmatched)

    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total people: {total_people}")
    print(f"Matched: {total_matched} ({total_matched/total_people*100:.1f}%)")
    print(f"Unmatched: {len(unmatched)} ({len(unmatched)/total_people*100:.1f}%)")
    print(f"Number of circles: {len(cycles)}")
    if cycles:
        circle_sizes = [len(c) for c in cycles]
        avg_size = sum(circle_sizes) / len(circle_sizes)
        print(f"Circle sizes: {', '.join(map(str, circle_sizes))}")
        print(f"Average circle size: {avg_size:.1f}")
        print(f"\n💡 Strategy: Smaller circles minimize risk - if one person backs out,")
        print(f"   fewer people are affected. This algorithm prioritizes the smallest")
        print(f"   possible circles while maximizing total matches.")
    print()


def print_results_with_preferences(cycles: List[List[Dict]], unmatched: List[Dict], preference_map: Dict[str, int]) -> None:
    """Print the matching results with preference information in a readable format."""
    print("=" * 80)
    print("CIRCULAR MATCHING RESULTS (WITH MULTIPLE PREFERENCES)")
    print("=" * 80)
    print()

    # Print cycles
    if cycles:
        print(f"✓ Found {len(cycles)} circular match(es):\n")

        for i, cycle in enumerate(cycles, 1):
            # Determine if this is a first-choice or second-choice circle
            preferences_in_cycle = [preference_map.get(p['name'], 1) for p in cycle]
            is_first_choice = all(p == 1 for p in preferences_in_cycle)
            is_second_choice = all(p == 2 for p in preferences_in_cycle)

            circle_label = ""
            if is_first_choice:
                circle_label = " [1st choice]"
            elif is_second_choice:
                circle_label = " [2nd choice]"
            else:
                circle_label = " [mixed preferences]"

            print(f"Circle {i}: {len(cycle)} people{circle_label}")
            print("-" * 40)

            for j, person in enumerate(cycle):
                next_person = cycle[(j + 1) % len(cycle)]
                pref_level = preference_map.get(person['name'], 1)
                pref_indicator = "✓" if pref_level == 1 else "②"

                print(f"  {pref_indicator} {person['name']} ({person['current_location']})")
                print(f"    Currently at: {person['current_huisarts']}")

                if pref_level == 1:
                    print(f"    Wants: {person['desired_huisarts']} in {person['new_location']} [1st choice]")
                else:
                    print(f"    Wants: {person.get('desired_huisarts_2', '')} in {person.get('new_location_2', '')} [2nd choice]")

                print(f"    → Gets spot from: {next_person['name']}")
                print()

            # Show the circular path
            names = [p['name'].split()[0] for p in cycle]  # First names only
            circular_path = " → ".join(names) + f" → {names[0]}"
            print(f"  Swap chain: {circular_path}")
            print()
    else:
        print("✗ No circular matches found.")
        print()

    # Print unmatched people
    if unmatched:
        print(f"⚠ {len(unmatched)} person(s) without a match:")
        print("-" * 40)

        for person in unmatched:
            print(f"  {person['name']} ({person['current_location']})")
            print(f"    Currently at: {person['current_huisarts']}")
            print(f"    1st choice: {person.get('desired_huisarts', '')} in {person.get('new_location', '')}")
            if person.get('desired_huisarts_2'):
                print(f"    2nd choice: {person.get('desired_huisarts_2', '')} in {person.get('new_location_2', '')}")
            print(f"    Reason: No matches found for any preferences")
            print()
    else:
        print("✓ Everyone is matched!")
        print()

    # Summary statistics
    total_matched = sum(len(cycle) for cycle in cycles)
    total_people = total_matched + len(unmatched)

    # Count preferences
    first_choice_count = sum(1 for pref in preference_map.values() if pref == 1)
    second_choice_count = sum(1 for pref in preference_map.values() if pref == 2)

    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total people: {total_people}")
    print(f"Matched: {total_matched} ({total_matched/total_people*100:.1f}%)")
    print(f"  - Got 1st choice: {first_choice_count} ({first_choice_count/total_people*100:.1f}%)")
    print(f"  - Got 2nd choice: {second_choice_count} ({second_choice_count/total_people*100:.1f}%)")
    print(f"Unmatched: {len(unmatched)} ({len(unmatched)/total_people*100:.1f}%)")
    print(f"Number of circles: {len(cycles)}")
    if cycles:
        circle_sizes = [len(c) for c in cycles]
        avg_size = sum(circle_sizes) / len(circle_sizes)
        print(f"Circle sizes: {', '.join(map(str, circle_sizes))}")
        print(f"Average circle size: {avg_size:.1f}")
        print(f"\n💡 Strategy: Smaller circles minimize risk - if one person backs out,")
        print(f"   fewer people are affected. This algorithm prioritizes the smallest")
        print(f"   possible circles while maximizing total matches.")
        print(f"\n🎯 Multiple preferences increase matching rate - people who couldn't")
        print(f"   match on their first choice may match on their second choice!")
    print()


def find_cycles_multi_preference(people: List[Dict]) -> Tuple[List[List[Dict]], Set[str], Dict[str, int]]:
    """
    Find cycles considering multiple preference levels.

    Strategy:
    1. Find all cycles using first preferences
    2. For unmatched people, try to find cycles using second preferences
    3. Prioritize smaller circles at each preference level
    4. Track which preference level each person got

    Returns:
        - List of selected cycles (as person dictionaries)
        - Set of practices in selected cycles
        - Dict mapping person name to preference level they got (1 or 2)
    """
    # Try first preferences
    print("  Trying first preferences...")
    graph1 = build_graph(people, preference_level=1)
    cycles1_raw = find_all_cycles(graph1)
    cycles1, used_practices1 = select_optimal_cycles(cycles1_raw, graph1)

    # Find who is still unmatched
    unmatched_people = [p for p in people if p['current_huisarts'] not in used_practices1]

    # Try second preferences for unmatched people
    print(f"  Found {len(cycles1)} circles with first preferences ({len(used_practices1)} people)")
    print(f"  Trying second preferences for {len(unmatched_people)} unmatched people...")

    graph2 = build_graph(unmatched_people, preference_level=2)
    cycles2_raw = find_all_cycles(graph2)
    cycles2, used_practices2 = select_optimal_cycles(cycles2_raw, graph2)

    # Combine results
    all_cycles = cycles1 + cycles2
    all_used_practices = used_practices1 | used_practices2

    # Track preference levels
    preference_map = {}
    for cycle in cycles1:
        for person in cycle:
            preference_map[person['name']] = 1
    for cycle in cycles2:
        for person in cycle:
            preference_map[person['name']] = 2

    print(f"  Found {len(cycles2)} additional circles with second preferences ({len(used_practices2)} people)")

    return all_cycles, all_used_practices, preference_map


def main():
    """Main function to run the matching algorithm."""
    csv_file = '../sample_circle.csv'

    print(f"Loading data from {csv_file}...")
    people = load_people_data(csv_file)
    print(f"Loaded {len(people)} people\n")

    print("Building graph and detecting cycles with multiple preferences...")
    cycles, practices_in_cycles, preference_map = find_cycles_multi_preference(people)
    unmatched = find_unmatched(people, practices_in_cycles)

    print_results_with_preferences(cycles, unmatched, preference_map)


if __name__ == '__main__':
    main()
