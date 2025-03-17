import Image from 'next/image';

export const PostHeader = () => {
  return (
    <>
      <div className="relative h-[calc(100vh/3)] w-full overflow-y-hidden">
        <Image
          src="https://s3-alpha-sig.figma.com/img/a7da/2200/f6c37edcb06722e854c1bd926a092148?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=IjHVya6B06YITdVivnBYWjzs-13yvVKMUe5JZiX7uWLLaObNzjO~agu1tNDAJ4AEaXxMmwKrEStC~C6pmaQ5JpNXlYSzWfMYHkwGwXM550D-OTMq3odI9rbPvnJjh2BjvoFi9VcRl~Ic4lIaPX~N33wJbhy41ccpcrFSF5Ig2U5CGa-bSh4Oz30ynRXXccgGWx1lktlfIRpqwznBFuVvT-03vBEblogKO2d0XEqsnb-jNPdRCrWfH6gwwQc6zlQyKvxCkwkaPxheKkW6EyS1Lw5PVN7dj5TRzj8~PiGXPb3QA6STQlXZ9VZ4HyRBQLdsZ4uIWqA91t-h2-Colh8OVA__"
          width={1200}
          height={675}
          className="aspect-video w-full object-cover"
          alt=""
        />
        <div className="from-background pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent" />
      </div>
      <h1 className="text-center text-3xl font-extrabold">
        The Rise of Artificial Intelligence in Healthcare
      </h1>
    </>
  );
};
