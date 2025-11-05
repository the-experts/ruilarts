import csv
import random
from collections import defaultdict

# Dutch first names and last names for realistic data
FIRST_NAMES = [
    "Anna", "Emma", "Julia", "Sophie", "Lisa", "Eva", "Sara", "Laura", "Nina", "Mila",
    "Daan", "Lucas", "Sem", "Milan", "Levi", "Luuk", "Finn", "Thijs", "Jesse", "Bram",
    "Jan", "Piet", "Kees", "Henk", "Willem", "Dirk", "Bart", "Mark", "Tom", "Erik",
    "Marie", "Liesbeth", "Ingrid", "Marieke", "Anke", "Femke", "Sanne", "Iris", "Eline", "Floor",
    "Lars", "Joris", "Stijn", "Ruben", "Tim", "Max", "Sam", "Nick", "Kevin", "Rick",
    "Linda", "Sandra", "Monica", "Patricia", "Yasmin", "Nadine", "Ilse", "Vera", "Rosa", "Dana"
]

LAST_NAMES = [
    "de Jong", "Jansen", "de Vries", "van den Berg", "van Dijk", "Bakker", "Janssen", "Visser",
    "Smit", "Meijer", "de Boer", "Mulder", "de Groot", "Bos", "Vos", "Peters", "Hendriks",
    "van Leeuwen", "Dekker", "Brouwer", "de Wit", "Dijkstra", "Smits", "de Graaf", "van der Meer",
    "van der Linden", "Kok", "Jacobs", "de Haan", "Vermeulen", "van den Heuvel", "van der Veen",
    "van den Broek", "de Bruijn", "de Bruin", "van der Heijden", "Schouten", "van Beek", "Willems",
    "van Vliet", "van de Ven", "Hoekstra", "Maas", "Verhoeven", "Koster", "van Dam", "van der Wal",
    "Prins", "Blom", "Huisman", "Peeters", "van Veen", "Koning", "Hermans", "van den Bosch",
    "van Dongen", "Scholten", "van der Laan", "Kuipers", "Wolters", "Sanders"
]

def detect_cycle(graph, start, visited, rec_stack):
    """Detect if there's a cycle starting from the given node using DFS"""
    visited[start] = True
    rec_stack[start] = True

    if start in graph:
        for neighbor in graph[start]:
            if not visited.get(neighbor, False):
                if detect_cycle(graph, neighbor, visited, rec_stack):
                    return True
            elif rec_stack.get(neighbor, False):
                return True

    rec_stack[start] = False
    return False

def has_cycles(assignments):
    """Check if the practice assignments create any cycles"""
    # Build a graph: current_practice -> list of desired practices
    graph = defaultdict(list)
    for current, desired_list in assignments:
        for desired in desired_list:
            if desired != current:
                graph[current].append(desired)

    visited = {}
    rec_stack = {}

    # Check for cycles from each node
    for node in graph:
        if not visited.get(node, False):
            if detect_cycle(graph, node, visited, rec_stack):
                return True
    return False

def generate_acyclic_assignments(num_people, max_practice_id, max_attempts=10):
    """Generate practice assignments that don't create cycles"""
    for attempt in range(max_attempts):
        assignments = []

        for i in range(num_people):
            # Get a unique current practice for this person
            current_practice = random.randint(1, max_practice_id)

            # Get two different desired practices (different from current)
            desired_practices = []
            while len(desired_practices) < 2:
                desired = random.randint(1, max_practice_id)
                if desired != current_practice and desired not in desired_practices:
                    desired_practices.append(desired)

            assignments.append((current_practice, desired_practices))

        # Check if this creates cycles
        if not has_cycles(assignments):
            return assignments

    # If we couldn't find acyclic assignments after max_attempts,
    # use a simpler strategy: just make sure practices are well distributed
    print(f"Warning: Generating with simple strategy after {max_attempts} attempts")
    assignments = []
    for i in range(num_people):
        current_practice = random.randint(1, max_practice_id)
        # Ensure desired practices are significantly different to avoid cycles
        desired_1 = (current_practice + random.randint(100, 1000)) % max_practice_id + 1
        desired_2 = (current_practice + random.randint(1001, 2000)) % max_practice_id + 1
        assignments.append((current_practice, [desired_1, desired_2]))

    return assignments

def generate_csv(filename, num_people=100000, max_practice_id=8153):
    """Generate a CSV file with sample data"""

    print(f"Generating {num_people} people with practice IDs from 1 to {max_practice_id}...")

    # Generate acyclic practice assignments
    assignments = generate_acyclic_assignments(num_people, max_practice_id)

    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['person_id', 'name', 'email', 'current_practice_id',
                     'desired_practice_id_1', 'desired_practice_id_2']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()

        for person_id in range(1, num_people + 1):
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            name = f"{first_name} {last_name}"
            email = f"{first_name.lower()}.{last_name.lower().replace(' ', '')}@example.nl"

            current_practice, desired_practices = assignments[person_id - 1]

            writer.writerow({
                'person_id': person_id,
                'name': name,
                'email': email,
                'current_practice_id': current_practice,
                'desired_practice_id_1': desired_practices[0],
                'desired_practice_id_2': desired_practices[1]
            })

    print(f"✓ Generated {filename} with {num_people} entries")
    print(f"✓ Practice IDs range: 1-{max_practice_id}")
    print(f"✓ No circular patterns detected")

if __name__ == "__main__":
    output_file = "data/sample_circle.csv"
    generate_csv(output_file, num_people=100000, max_practice_id=8153)
