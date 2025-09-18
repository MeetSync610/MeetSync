import "../styles/AuthCard.css";

type Props = {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthCard({ title, children, footer }: Props) {
  return (
    <div className="authcard">
      {title ? <h1 className="authcard__title">{title}</h1> : null}
      <div className="authcard__body">{children}</div>
      {footer ? <div className="authcard__footer">{footer}</div> : null}
    </div>
  );
}
