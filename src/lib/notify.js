import { sileo } from "sileo";

const opts = {
  fill: "#204B54",
  darkFill: "#204B54",
  styles: {
    title: "text-[#00E3F6] font-bold",
    description: "text-[#00E3F6]/70",
    badge: "border border-[#00E3F6]/40",
  },
};

export const notify = {
  success: (title, description) =>
    sileo.success({ title, description, ...opts }),
  error: (title, description) => sileo.error({ title, description, ...opts }),
  warning: (title, description) =>
    sileo.warning({ title, description, ...opts }),
  info: (title, description) => sileo.info({ title, description, ...opts }),
};
