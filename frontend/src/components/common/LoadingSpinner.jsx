import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="state-box" role="status">
      <Loader2 size={28} className="spinner" />
      <p className="state-description">{label}</p>
    </div>
  );
}
