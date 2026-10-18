import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useIDPRecordsData } from "../../../store/IDPRecordsSlice";

export const useCreateIDPRecords = () => {
  const dispatch = useDispatch();
  const { idpRecords } = useIDPRecordsData();
  useEffect(() => {
    if (idpRecords.length === 0) {
      return;
    }
    function createIDPRecords() {
      console.log("useCreateIDPRecords idpRecords", idpRecords);
    }
    createIDPRecords();
  }, [idpRecords]);
};
