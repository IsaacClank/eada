import dayjs from "dayjs";
import dayjsUtc from "dayjs/plugin/utc";

dayjs.extend(dayjsUtc);
export const datetime = () => dayjs();
