export function BackgroundMesh() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <i className="mesh-blob -left-[10vw] -top-[12vw] size-[46vw] bg-blob-1" />
        <i className="mesh-blob -right-[12vw] top-[10vh] size-[42vw] bg-blob-2" />
        <i className="mesh-blob -bottom-[18vw] left-[30vw] size-[34vw] bg-blob-3" />
      </div>
      <div className="grain" aria-hidden="true" />
    </>
  );
}
