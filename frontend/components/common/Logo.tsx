import Image from "next/image";
import Link from "next/link";

export function Logo({ withTagline = false }: { withTagline?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 focus-ring rounded-lg">
      <Image
        src="/images/logo.png"
        alt="Ellevadz — Elle s'élève"
        width={160}
        height={55}
        priority
        className="h-11 w-auto mix-blend-multiply"
      />

      {withTagline && (
        <span className="hidden font-script text-2xl text-wine-500 sm:inline">
          Elle s&apos;élève
        </span>
      )}
    </Link>
  );
}
