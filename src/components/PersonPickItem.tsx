import "../styles/PersonPickItem.css";

type Mode = "radio" | "checkbox";
type Props = {
  name: string;
  mode: Mode;
  group?: string;        // name del radio group
  onChange?: () => void; // mock
};

export default function PersonPickItem({ name, mode, group = "group", onChange }: Props) {
  return (
    <label className="ppick">
      {mode === "checkbox" ? <input type="checkbox" onChange={onChange} /> : null}
      {mode === "radio" ? <input type="radio" name={group} onChange={onChange} /> : null}
      <div className="ppick__avatar" />
      <span className="ppick__name">{name}</span>
    </label>
  );
}
