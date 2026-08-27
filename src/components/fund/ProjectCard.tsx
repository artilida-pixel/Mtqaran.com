import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionaries";
import { pickLocalized } from "@/lib/localized";
import { formatAmd, progressPercent } from "@/lib/utils";
import type { ProjectModel } from "@/generated/prisma/models";

export default function ProjectCard({
  project,
  lang,
  dict,
  villageName,
}: {
  project: ProjectModel;
  lang: Locale;
  dict: Dictionary;
  villageName?: string;
}) {
  const title = pickLocalized(project, "title", lang);
  const description = pickLocalized(project, "description", lang);
  const percent = progressPercent(project.raisedAmount, project.goalAmount);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      {villageName && <p className="text-xs font-semibold text-brand-apricot-dark">{villageName}</p>}
      <h3 className="mt-1 font-semibold leading-snug">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted">{description}</p>}

      <div className="mt-4">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span>
            <span className="font-semibold">{formatAmd(project.raisedAmount, lang)}</span>{" "}
            <span className="text-muted">/ {formatAmd(project.goalAmount, lang)} {dict.common.amd}</span>
          </span>
          <span className="font-semibold text-foreground">{percent}%</span>
        </div>
      </div>
    </div>
  );
}
