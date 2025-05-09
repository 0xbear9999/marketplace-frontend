
const RequireAlert = ({
  className = "",
  value,
  text,
}: {
  className?: string;
  value?: any;
  text?: string;
}) => {
  return !value ? (
    <div className={`${className} mt-1 text-xs text-danger font-semibold`}>*{text}</div>
  ) : (
    <div />
  );
};

export default RequireAlert;
