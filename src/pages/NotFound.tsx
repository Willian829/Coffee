import { Link } from "react-router";
import { Bean } from "../components/illustrations";

export default function NotFound() {
  return (
    <div className="wrap grid min-h-[80vh] place-items-center pt-24 text-center">
      <div>
        <div className="flex justify-center gap-2">
          <Bean color="#7b4e2b" size={90} rotate={-20} />
          <Bean color="#33200f" size={90} rotate={20} gloss={0.9} />
        </div>
        <p className="display mt-6 text-8xl">404</p>
        <p className="mt-3 text-lg text-ink-2">Esta página passou do ponto de torra.</p>
        <Link to="/" className="btn btn-primary mt-8">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
