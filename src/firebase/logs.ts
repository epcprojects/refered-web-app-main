import { addDoc, collection } from "firebase/firestore";
import { firebase } from ".";

type SaveLog_Body = {
  error: string;
  errorInfo: string;
};

const SaveLog = async (body: SaveLog_Body) => {
  const { error, errorInfo } = body;
  const logRef = collection(firebase.firestore, firebase.collections.logs);
  await addDoc(logRef, { error, errorInfo });
};

export { SaveLog };

