import type { PLANS } from "./plans.constants";

type PlanCardProps = { plan: (typeof PLANS)[number] };

export function PlanCard({ plan }: PlanCardProps) {
  const border = plan.recommended ? "border-orange-deep" : "border-brass/30";
  return (
    <div className={`rounded-lg border p-8 ${border}`}>
      {plan.recommended && (
        <span className="inline-block rounded-full border border-orange-deep bg-orange-deep px-3 py-1 text-xs font-semibold text-white">
          Recommended
        </span>
      )}
      <h3 className="mt-4 text-xl font-semibold">{plan.name}</h3>
      <p className="mt-1 text-sm text-marine/60">{plan.description}</p>
      <p className="mt-6 text-3xl font-semibold">{plan.price}</p>
      <p className="text-sm text-marine/60">{plan.unit}</p>
      <ul className="mt-6 space-y-2 text-sm">
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </div>
  );
}
