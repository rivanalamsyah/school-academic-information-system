import { useContext } from "react";
import { SchoolDataContext } from "../providers/SchoolDataProvider";

export function useSchoolData() {
  const context = useContext(SchoolDataContext);
  if (context === undefined) {
    throw new Error("useSchoolData must be used within a SchoolDataProvider");
  }
  return context;
}
export default useSchoolData;
