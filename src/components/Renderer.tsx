import type { DSLNode } from "../schema/types";

export default function Renderer({ node }: { node: DSLNode }) {
	if (!node) return null;

	//  类型收窄
	switch (node.type) {
		case "text":
			return <p>{node.content}</p>;

		case "button":
			return <button>{node.label}</button>;

		case "card":
			return (
				<div style={{ border: "1px solid #ccc", padding: 16 }}>
					{node.children.map((child, index) => (
						<Renderer key={index} node={child} />
					))}
				</div>
			);

		default:
			return <div>Unknown node</div>;
	}
}