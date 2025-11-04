import { GetMatchesResponse } from "@/interfaces/Matches";
import { useMemo } from "react";
import { GraphCanvas, GraphEdge, GraphNode } from "reagraph";

export function MultiCircleGraph({
  circles,
}: {
  circles: GetMatchesResponse["circles"];
}) {
  const { nodes, edges } = useMemo(() => {
    // Convert to Reagraph format
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    circles.forEach((circle) => {
      circle.members.forEach((member) => {
        nodes.push({
          id: member.person_id,
          label: member.person_name,
          cluster: circle.id, // group by circle
        });

        edges.push({
          id: `${member.gets_spot_from}->${member.person_id}`,
          target: member.gets_spot_from,
          source: member.person_id,
          label: "gets spot from",
        });
      });

    
    });
      return { nodes, edges };
  }, [circles]);

  return (
    <div className="w-full">
      <GraphCanvas
        nodes={nodes}
        edges={edges}
        layoutType="concentric2d"
        draggable
      />
    </div>
  );
}
