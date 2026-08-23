import { RiseStroke } from "@/components/common/RiseStroke";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-rise-gradient-soft px-6 py-16 lg:px-10">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl shadow-bloom lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between bg-rise-gradient p-10 text-white lg:flex">
          <p className="font-script text-4xl">Elle s&apos;élève</p>
          <div>
            <p className="max-w-sm text-white/85 leading-relaxed">
              Rejoignez une communauté de femmes entrepreneures et accédez à des financements, un mentorat et des outils pensés pour vous.
            </p>
            <RiseStroke className="mt-6 h-12 w-40" />
          </div>
          <p className="text-xs text-white/60">© {new Date().getFullYear()} Ellevadz</p>
        </div>

        <div className="bg-white p-10">
          <h1 className="font-display text-3xl text-ink">{title}</h1>
          <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

