import { Metadata } from "next";
import NoSSRWrapper from "./NoSSRWrapper";

export const metadata: Metadata = {
  title: "Convert video to audio",
  description: "Extract audio from video files for free.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NoSSRWrapper>{children}</NoSSRWrapper>;
}
