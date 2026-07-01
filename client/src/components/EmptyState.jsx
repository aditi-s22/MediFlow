import { Link } from "react-router-dom";

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-white py-16 text-center ring-1 ring-gray-100">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
          <Icon className="h-7 w-7 text-blue-400" strokeWidth={1.5} />
        </div>
      )}
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
      {action && (
        <Link
          to={action.to}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
