import Warroom from "./Warroom";

export const metadata = {
  title: "Mint Config Warroom",
  description: "PIN-gated editor for Mint's runtime configuration.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Warroom />;
}
