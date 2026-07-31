export function formatDate(isoString: any) {
  const date = new Date(isoString);

  // Format date part
  const datePart = date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Format time part
  // const timePart = date.toLocaleString("en-US", {
  //   hour: "numeric",
  //   minute: "2-digit",
  //   hour12: true,
  // });

  // return `${datePart} & ${timePart}`;
  return `${datePart}`;
}


export function formatTime(isoString: any) {
  const date = new Date(isoString);

  // Format date part
  // const datePart = date.toLocaleString("en-US", {
  //   month: "short",
  //   day: "numeric",
  //   year: "numeric",
  // });

  // Format time part
  const timePart = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // return `${datePart} & ${timePart}`;
  return `${timePart}`;
}
