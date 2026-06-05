import { prisma } from "@/lib/prisma";


export default async function Home() {
  const data = ['ad', 'sd'];

  return (
    <>
      {data.map((item: any, index: number) => (
        <div key={index}>
          {item}
        </div>
      ))}
    </>
  );
}
