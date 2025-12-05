import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { useEffect } from "react";
import { getUserProfileStage3 } from "../../api/user/uProfileCreationService";
import toast from "react-hot-toast";
import {
  setBronchialAsthma,
  setEpilepsy,
  setTb,
} from "../../state/user/uProfileCreationSlice";
import getIcon from "../../helpers/getIcon";

function UProfileIllness() {
  const dispatch = useDispatch();
  const tb = useSelector((state: RootState) => state.uProfileCreation.tb);
  const bronchialAsthma = useSelector(
    (state: RootState) => state.uProfileCreation.bronchialAsthma
  );
  const epilepsy = useSelector(
    (state: RootState) => state.uProfileCreation.epilepsy
  );

  useEffect(() => {
    if (tb == null || bronchialAsthma == null || epilepsy == null) {
      getUserProfileStage3()
        .then((response) => {
          const data = response.data;
          dispatch(setTb(data.tb));
          dispatch(setBronchialAsthma(data.bronchialAsthma));
          dispatch(setEpilepsy(data.epilepsy));
        })
        .catch((err) => {
          console.log(err);
          toast.error("An error occured while fetching data.");
        });
    }
  }, []);

  return (
    <>
      <div className="space-y-4 bg-white p-12 pt-8 rounded-2xl border-1 border-gray-200">
        <div className="flex gap-3 items-center justify-between">
          <span className="uppercase font-semibold">Previous Illnesses</span>
          <span className=" font-medium text-darkGreen hover:text-green-600 hover:bg-green-200 transition-all duration-200 active:scale-85 cursor-pointer bg-green-200/70 px-4 py-2 rounded-lg flex items-center gap-2">
            {getIcon("edit", "20px", "green-200")}
            Edit
          </span>
        </div>
        <div className="grid grid-cols-2 grid-flow-row gap-y-2">
          <div>Tuberculosis</div>
          <div>{tb === true ? "Yes" : "No"}</div>
          <div>Bronchial Asthma</div>
          <div>{bronchialAsthma === true ? "Yes" : "No"}</div>
          <div>Epilepsy</div>
          <div>{epilepsy === true ? "Yes" : "No"}</div>
        </div>
      </div>
    </>
  );
}

export default UProfileIllness;
