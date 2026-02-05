export default function ProfileHeader() {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white font-bold">
          V
        </div>

        <div>
          <p className="text-sm font-semibold">Vendor Account</p>
          <p className="text-xs text-gray-500">vendor@greenfarm.ng</p>
        </div>
      </div>
    </div>
  );
}
