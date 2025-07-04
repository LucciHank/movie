import { LoadingButton } from "@mui/lab";
import { Alert, Box, Button, Stack, TextField, Typography, InputAdornment, IconButton } from "@mui/material";
import { useFormik } from "formik";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import * as Yup from "yup";
import userApi from "../../api/modules/user.api";
import { setAuthModalOpen } from "../../redux/features/authModalSlice";
import { setUser } from "../../redux/features/userSlice";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const SigninForm = ({ switchAuthState }) => {
  const dispatch = useDispatch();

  const [isLoginRequest, setIsLoginRequest] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const signinForm = useFormik({
    initialValues: {
      password: "",
      username: ""
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(8, "Tên đăng nhập tối thiểu 8 ký tự")
        .required("Vui lòng nhập tên đăng nhập"),
      password: Yup.string()
        .min(8, "Mật khẩu tối thiểu 8 ký tự")
        .required("Vui lòng nhập mật khẩu")
    }),
    onSubmit: async values => {
      setErrorMessage(undefined);
      setIsLoginRequest(true);
      const { response, err } = await userApi.signin(values);
      setIsLoginRequest(false);

      if (response) {
        signinForm.resetForm();
        dispatch(setUser(response));
        dispatch(setAuthModalOpen(false));
        toast.success("Đăng nhập thành công");
      }

      if (err) setErrorMessage(err.message);
    }
  });

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box component="form" onSubmit={signinForm.handleSubmit}>
      <Typography variant="h5" fontWeight={600} textAlign="center" mb={4}>
        Đăng nhập
      </Typography>
      
      <Stack spacing={3}>
        <TextField
          type="text"
          label="Tên đăng nhập"
          name="username"
          fullWidth
          value={signinForm.values.username}
          onChange={signinForm.handleChange}
          color="primary"
          variant="outlined"
          error={signinForm.touched.username && signinForm.errors.username !== undefined}
          helperText={signinForm.touched.username && signinForm.errors.username}
          InputProps={{
            sx: { borderRadius: 1, bgcolor: 'background.paper' }
          }}
        />
        <TextField
          type={showPassword ? "text" : "password"}
          label="Mật khẩu"
          name="password"
          fullWidth
          value={signinForm.values.password}
          onChange={signinForm.handleChange}
          color="primary"
          variant="outlined"
          error={signinForm.touched.password && signinForm.errors.password !== undefined}
          helperText={signinForm.touched.password && signinForm.errors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={toggleShowPassword} edge="end">
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
            sx: { borderRadius: 1, bgcolor: 'background.paper' }
          }}
        />
      </Stack>

      <LoadingButton
        type="submit"
        fullWidth
        size="large"
        variant="contained"
        sx={{ 
          marginTop: 4,
          py: 1.2,
          borderRadius: 1,
          fontWeight: 500,
          fontSize: '0.9rem'
        }}
        loading={isLoginRequest}
      >
        Đăng nhập
      </LoadingButton>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          Chưa có tài khoản?
        </Typography>
        <Button
          fullWidth
          variant="outlined"
          sx={{ borderRadius: 1 }}
          onClick={() => switchAuthState()}
        >
          Đăng ký
        </Button>
      </Box>

      {errorMessage && (
        <Box sx={{ marginTop: 2 }}>
          <Alert severity="error" variant="outlined" >{errorMessage}</Alert>
        </Box>
      )}
    </Box>
  );
};

export default SigninForm;