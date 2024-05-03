import NoSSRWrapper from "./NoSSRWrapper";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NoSSRWrapper>{children}</NoSSRWrapper>;
}
