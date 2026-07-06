export function useSidebar() {
  const isOpen = useState("sidebar-open", () => true);

  function toggle() {
    isOpen.value = !isOpen.value;
  }

  return { isOpen, toggle };
}
