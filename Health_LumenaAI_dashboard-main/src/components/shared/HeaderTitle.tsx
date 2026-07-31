import { cn } from "@/lib/utils";

interface HeaderTitleProps {
  title: string;
  subtitle?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  containerClassName?: string;
  titleColor?: "primary" | "secondary" | "gray" | "white";
  titleSize?: "sm" | "md" | "lg" | "xl";
  alignment?: "left" | "center" | "right";
}

const HeaderTitle = ({
  title,
  subtitle,
  titleClassName,
  subtitleClassName,
  containerClassName,
  titleColor = "primary",
  titleSize = "lg",
  alignment = "center",
}: HeaderTitleProps) => {
  // Title color variants
  const titleColorClasses = {
    primary: "text-[#1B22E5]",
    secondary: "text-[#F56B0C]",
    gray: "text-gray-900",
    white: "text-white",
  };

  // Title size variants
  const titleSizeClasses = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-3xl md:text-4xl",
    xl: "text-4xl md:text-5xl",
  };

  // Alignment classes
  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div
      className={cn("mb-12", alignmentClasses[alignment], containerClassName)}
    >
      <h2
        className={cn(
          "font-bold mb-4",
          titleSizeClasses[titleSize],
          titleColorClasses[titleColor],
          titleClassName
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "text-lg text-gray-600 max-w-2xl",
            alignment === "center" && "mx-auto",
            alignment === "right" && "ml-auto",
            subtitleClassName
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default HeaderTitle;
