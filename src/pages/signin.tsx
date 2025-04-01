import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import AppTheme from "../theme/AppTheme";
import { Dialog, DialogContent, IconButton, InputAdornment, Modal, styled } from "@mui/material";
import { signInWithCredentials, signInWithGoogle } from "../firebase/auth";
import { Link, useNavigate } from "react-router";
import { useSession } from "../SessionContext";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import SecurityQuestionModal from "../components/SecurityQuestionModal";
import emailjs from "emailjs-com";
import OPTModal from "../components/OPTModal";
import TOTPModal from "../components/TOTPModal";
import axios from "axios";
import bcrypt from 'bcryptjs';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
}));

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [isQAModalOpen, setIsQAModalOpen] = React.useState(false);
  const [QA, setQA] = React.useState({ question: "", answer: "" });
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [otpCode, setOtpCode] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [emailOTP, setEmailOTP] = React.useState(null);
  const [isTOTPModalOpen, setIsTOTPModalOpen] = React.useState(false);
  const [totpemail, settotpemail] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  // Toggle password visibility
  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  const { setSession } = useSession();
  const navigate = useNavigate();

  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  };

  const sendOtpEmail = (email: string, otp: string) => {
    emailjs
      .send(
        "service_4u2bg14",
        "template_ahpsphg",
        {
          user_email: email,
          otp_code: otp,
        },
        "EwywpQtqP7eOytOy-"
      )
      .then(() => {
        console.log("OTP sent successfully");
        setOtpCode(otp); // Set OTP to display in the modal
        setIsModalOpen(true); // Open modal after OTP is sent
      })
      .catch((error) => {
        console.error("Error sending OTP:", error);
      });
  };

  const fetchSecurityQuestions = async (uid: string) => {
    try {
      const db = getFirestore();
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData?.authMethod === "email") {
          const otpCode: any = generateOTP();
          setEmailOTP(otpCode);
          sendOtpEmail(userData?.email, otpCode);
        }
        if (userData?.authMethod === "questions") {
          setIsQAModalOpen(true);
          const questions = userData?.securityQuestions || [];
          const randomIndex = Math.floor(Math.random() * questions.length);
          setQA(questions[randomIndex]);
          console.log("Security Questions:", userData.securityQuestions);
        }

        if (userData?.authMethod === "TOTP") {
          setIsTOTPModalOpen(true);
          settotpemail(userData?.email)
          console.log("Security Questions:", userData.securityQuestions);
        }
      }
    } catch (error) {
      console.error("Error fetching security questions:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Check for form validation errors
    if (emailError || passwordError) {
      return;
    }

    const data = new FormData(event.currentTarget);
    const email: string = data.get("email") as string;
    const password: string = data.get("password") as string;

    try {
      const result: any = await signInWithCredentials(email, password);

      // Check if sign-in was successful
      if (result?.success && result?.user) {
        const userSession: any = {
          user: {
            name: result.user.displayName || "",
            email: result.user.email || "",
            image: result.user.photoURL || "",
          },
        };

        // Set the session
        setSession(userSession);

        // Fetch security questions after successful sign-in
        await fetchSecurityQuestions(result.user.uid);
      }
    } catch (error: any) {
      // Simplified error messages
      let errorMessage = "An error occurred. Please try again.";
      console.log("###error", error.code)
      if (error?.code) {
        switch (error.code) {
          case "auth/invalid-credential":
            errorMessage = "Invalid Credentials!";
            break;
          case "auth/user-not-found":
            errorMessage = "Email not found!";
            break;
          case "auth/wrong-password":
            errorMessage = "Credentials are invalid!";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many attempts. Try again later.";
            break;
          case "auth/network-request-failed":
            errorMessage = "Network error. Check your connection.";
            break;
          default:
            break;
        }
      }

      // Display error message to the user
      toast.error(errorMessage); // Example using toast notifications
    }
  };


  const handleOtpSubmit = (values: any) => {
    console.log("###value", values);
    if (Number(emailOTP) === Number(values.otp)) {
      toast.success("OTP verified successfully!");
      setIsModalOpen(false);
      navigate("/", { replace: true });
    } else {
      toast.error("Incorrect OTP, please try again.");
    }
  };

  const validateInputs = () => {
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };
  const qaSubmitHandler = async (answer: string) => {
    const isMatch = await bcrypt.compare(answer, QA.answer);
    if (isMatch) {
      toast.success("Login Successfully!");
      navigate('/', { replace: true });
    } else {
      toast.error("Incorrect answer. Please try again.");
    }
  }
  const handletotpSubmit = async (values: any) => {
    // if(answer === QA.answer) {
    //   toast.success("Login Successfully!");
    //   navigate('/', { replace: true });
    // } else {
    //   toast.error("Incorrect answer. Please try again.");
    // }
    // values.otp in backend and email
    //  console.log(email)
    const response = await axios.post("http://localhost:5000/api/otp/verify", {
      email: totpemail,
      token: values.otp,
    });
    console.log(response)
    if (response?.data?.verified) {
      navigate('/');
    }
  }

  const signInWithGoogleHandler = async () => {
    const result = await signInWithGoogle();
    try {
      if (result?.success && result?.user) {
        // Convert Firebase user to Session format
        const userSession: any = {
          user: {
            name: result.user.displayName || '',
            email: result.user.email || '',
            image: result.user.photoURL || '',
          },
        };
        setSession(userSession);
        navigate('/', { replace: true });
        toast.success("Login Successfully!");
        return {};
      }
      return { error: result?.error || 'Failed to sign in' };
    } catch (error) {
      toast.error("Something went wrong!");
      return { error: error instanceof Error ? error.message : 'An error occurred' };
    }
  }



  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <SecurityQuestionModal
        isQAModalOpen={isQAModalOpen}
        handleClose={() => setIsQAModalOpen(false)}
        QA={QA}
        qaSubmitHandler={qaSubmitHandler}
      />
      <OPTModal
        isOpen={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
        handleSubmit={handleOtpSubmit}
      />
      <TOTPModal
        isOpen={isTOTPModalOpen}
        handleClose={() => setIsTOTPModalOpen(false)}
        handleSubmit={handletotpSubmit}
      />
      <AppTheme {...props}>
        <CssBaseline enableColorScheme />
        <SignInContainer direction="column" justifyContent="space-between">
          <Card variant="outlined">
            <Typography
              component="h1"
              variant="h4"
              sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
            >
              Sign in
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: 2,
              }}
            >
              <FormControl>
                <FormLabel htmlFor="email">Email</FormLabel>
                <TextField
                  error={emailError}
                  helperText={emailErrorMessage}
                  id="email"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  autoFocus
                  required
                  fullWidth
                  variant="outlined"
                  color={emailError ? "error" : "primary"}
                />
              </FormControl>
              <FormControl fullWidth>
                <FormLabel htmlFor="password">Password</FormLabel>
                <TextField
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  name="password"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  required
                  variant="outlined"
                  color={passwordError ? 'error' : 'primary'}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleClickShowPassword} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  }}
                />
              </FormControl>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button type="submit" fullWidth variant="contained">
                Sign In
              </Button>
              <Divider variant="middle" sx={{ width: "100%" }} />
              <Button
                onClick={signInWithGoogleHandler}
                fullWidth
                sx={{ mt: 1 }}
                variant="outlined"
              >
                Sign In with Google
              </Button>
            </Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              sx={{ width: "100%", gap: 1 }}
            >
              <Typography variant="body1">New to the platform?</Typography>
              <Link to="/sign-up">
                Sign Up
              </Link>
            </Stack>
          </Card>
        </SignInContainer>
      </AppTheme>


    </>
  );
}
