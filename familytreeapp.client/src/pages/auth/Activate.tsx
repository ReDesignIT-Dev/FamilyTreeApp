import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { activateUser } from "@/services/auth/apiRequestsUser";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { GeneralApiError } from "@/services/CustomErrors";

const Activate: React.FC = () => {
  const { userId, token } = useParams<{ userId: string; token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!userId || !token) {
      setStatus("error");
      setMessage("Invalid activation link.");
      return;
    }

    activateUser(Number(userId), token)
      .then(() => {
        setStatus("success");
        setMessage("Your account has been activated! You can now log in.");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(
          error instanceof GeneralApiError
            ? error.message
            : "Activation failed. The link may have expired."
        );
      });
  }, [userId, token]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" mt={8}>
      {status === "loading" && <CircularProgress />}
      {status === "success" && <Alert severity="success">{message}</Alert>}
      {status === "error" && <Alert severity="error">{message}</Alert>}
    </Box>
  );
};

export default Activate;