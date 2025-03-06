import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import AppTheme from '../theme/AppTheme';
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Modal, styled } from '@mui/material';
import { signInWithCredentials, signInWithGoogle } from '../firebase/auth';
import { Link, Navigate, useNavigate } from 'react-router';
import { useSession, type Session } from '../SessionContext';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import SecurityQuestionModal from '../components/SecurityQuestionModal';


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [isQAModalOpen, setIsQAModalOpen] = React.useState(false);
  const [QA, setQA] = React.useState({ question: '', answer: '' });
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const { session, setSession, loading } = useSession();
  const navigate = useNavigate();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


  const fetchSecurityQuestions = async (uid: string) => {
    try {
      const db = getFirestore();
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("##userData", userData)
        if (userData?.authMethod === "questions") {
          setIsQAModalOpen(true);
          const questions = userData?.securityQuestions || [];
          const randomIndex = Math.floor(Math.random() * questions.length);
          setQA(questions[randomIndex]);
          console.log("Security Questions:", userData.securityQuestions);
        }
      } else {
        console.log("No user document found!");
      }
    } catch (error) {
      console.error("Error fetching security questions:", error);
    }
  };

  console.log("###QA", QA)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (emailError || passwordError) {
      return;
    }
    const data = new FormData(event.currentTarget);
    const email: any = data.get('email');
    const password: any = data.get('password');
    const result: any = await signInWithCredentials(email, password);
    console.log("##result", result)
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
      await fetchSecurityQuestions(result.user.uid);
      // navigate('/', { replace: true });

      // Fetch security questions
    }
  };

  const validateInputs = () => {
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const signInWithGoogleHandler = async () => {
    const result: any = await signInWithGoogle();
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
    }
  }

  const qaSubmitHandler = (answer:string) => {
    if(answer === QA.answer) {
      toast.success("Login Successfully!");
      navigate('/', { replace: true });
    } else {
      toast.error("Incorrect answer. Please try again.");
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
      <AppTheme {...props}>
        <CssBaseline enableColorScheme />
        <SignInContainer direction="column" justifyContent="space-between">

          {/* <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} /> */}
          <Card variant="outlined">
            <Typography
              component="h1"
              variant="h4"
              sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
            >
              Sign in
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
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
                  color={emailError ? 'error' : 'primary'}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor="password">Password</FormLabel>
                <TextField
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  name="password"
                  placeholder="••••••"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  autoFocus
                  required
                  fullWidth
                  variant="outlined"
                  color={passwordError ? 'error' : 'primary'}
                />
              </FormControl>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              {/* <ForgotPassword open={open} handleClose={handleClose} /> */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                onClick={validateInputs}
              >
                Sign in
              </Button>
              {/* <Link
              type="button"
              to="forgot-password"
              // onClick={handleClickOpen}
              style={{ alignSelf: 'center', color: 'white' }}
            >
              Forgot your password?
            </Link> */}
            </Box>
            <Divider>or</Divider>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                type="button"
                onClick={signInWithGoogleHandler}
              // startIcon={<GoogleIcon />}
              >
                Sign in with Google
              </Button>
              <Typography sx={{ textAlign: 'center' }}>
                Don&apos;t have an account?{' '}
                <Link
                  to="/sign-up"
                  style={{ alignSelf: 'center' }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Card>
        </SignInContainer>
      </AppTheme>
    </>
  );
}
