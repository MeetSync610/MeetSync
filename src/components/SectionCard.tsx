import "../styles/SectionCard.css";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function SectionCard({ title, description, children }: Props) {
  return (
    <div className="sectioncard">
      <h2 className="sectioncard__title">{title}</h2>
      {description ? <p className="sectioncard__desc">{description}</p> : null}
      <div className="sectioncard__body">{children}</div>
    </div>
  );
}
