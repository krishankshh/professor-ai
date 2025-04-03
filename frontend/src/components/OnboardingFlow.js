import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const OnboardingFlow = () => {
  const [step, setStep] = React.useState(1);
  const [userData, setUserData] = React.useState({
    name: '',
    email: '',
    password: '',
    academicBackground: '',
    learningPreferences: {
      preferredExamples: 'practical',
      communicationStyle: 'conversational',
      detailLevel: 'balanced'
    }
  });

  // Validation schemas for each step
  const Step1Schema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required')
  });

  const Step2Schema = Yup.object().shape({
    academicBackground: Yup.string().required('Please select your academic background')
  });

  const Step3Schema = Yup.object().shape({
    preferredExamples: Yup.string().required('Please select your preference'),
    communicationStyle: Yup.string().required('Please select your preference'),
    detailLevel: Yup.string().required('Please select your preference')
  });

  // Handle step 1 submission
  const handleStep1Submit = (values) => {
    setUserData({
      ...userData,
      name: values.name,
      email: values.email,
      password: values.password
    });
    setStep(2);
  };

  // Handle step 2 submission
  const handleStep2Submit = (values) => {
    setUserData({
      ...userData,
      academicBackground: values.academicBackground
    });
    setStep(3);
  };

  // Handle step 3 submission
  const handleStep3Submit = (values) => {
    setUserData({
      ...userData,
      learningPreferences: {
        preferredExamples: values.preferredExamples,
        communicationStyle: values.communicationStyle,
        detailLevel: values.detailLevel
      }
    });
    // In a real implementation, this would call the registration API
    console.log('Final user data:', userData);
    setStep(4);
  };

  // Handle final submission
  const handleFinalSubmit = async () => {
    try {
      // In a real implementation, this would call the API
      // await authService.register(userData);
      
      // Redirect to dashboard or login
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Welcome to Professor AI
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your personalized AI tutoring experience
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between">
              <div className={`text-sm ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>Account</div>
              <div className={`text-sm ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>Background</div>
              <div className={`text-sm ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>Preferences</div>
              <div className={`text-sm ${step >= 4 ? 'text-primary-600' : 'text-gray-400'}`}>Complete</div>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-primary-600 rounded-full transition-all duration-300"
                style={{ width: `${(step - 1) * 33.33}%` }}
              ></div>
            </div>
          </div>

          {/* Step 1: Account Information */}
          {step === 1 && (
            <Formik
              initialValues={{
                name: userData.name,
                email: userData.email,
                password: userData.password,
                confirmPassword: userData.password
              }}
              validationSchema={Step1Schema}
              onSubmit={handleStep1Submit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <Field
                      type="text"
                      name="name"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <Field
                      type="email"
                      name="email"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Field
                      type="password"
                      name="password"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <Field
                      type="password"
                      name="confirmPassword"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Continue
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          {/* Step 2: Academic Background */}
          {step === 2 && (
            <Formik
              initialValues={{
                academicBackground: userData.academicBackground
              }}
              validationSchema={Step2Schema}
              onSubmit={handleStep2Submit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="mb-6">
                    <label htmlFor="academicBackground" className="block text-sm font-medium text-gray-700 mb-2">
                      What is your academic background?
                    </label>
                    <Field
                      as="select"
                      name="academicBackground"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select your background</option>
                      <option value="high_school">High School</option>
                      <option value="undergraduate">Undergraduate</option>
                      <option value="graduate">Graduate</option>
                      <option value="phd">PhD</option>
                      <option value="professional">Professional</option>
                    </Field>
                    <ErrorMessage name="academicBackground" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Continue
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          {/* Step 3: Learning Preferences */}
          {step === 3 && (
            <Formik
              initialValues={{
                preferredExamples: userData.learningPreferences.preferredExamples,
                communicationStyle: userData.learningPreferences.communicationStyle,
                detailLevel: userData.learningPreferences.detailLevel
              }}
              validationSchema={Step3Schema}
              onSubmit={handleStep3Submit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="mb-4">
                    <label htmlFor="preferredExamples" className="block text-sm font-medium text-gray-700 mb-2">
                      What type of examples do you prefer?
                    </label>
                    <Field
                      as="select"
                      name="preferredExamples"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="practical">Practical (real-world applications)</option>
                      <option value="theoretical">Theoretical (conceptual understanding)</option>
                      <option value="mixed">Mixed (both practical and theoretical)</option>
                    </Field>
                    <ErrorMessage name="preferredExamples" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="communicationStyle" className="block text-sm font-medium text-gray-700 mb-2">
                      What communication style do you prefer?
                    </label>
                    <Field
                      as="select"
                      name="communicationStyle"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="conversational">Conversational (friendly and casual)</option>
                      <option value="formal">Formal (professional and academic)</option>
                      <option value="direct">Direct (concise and to the point)</option>
                    </Field>
                    <ErrorMessage name="communicationStyle" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="detailLevel" className="block text-sm font-medium text-gray-700 mb-2">
                      How detailed should explanations be?
                    </label>
                    <Field
                      as="select"
                      name="detailLevel"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="concise">Concise (brief overviews)</option>
                      <option value="balanced">Balanced (moderate detail)</option>
                      <option value="comprehensive">Comprehensive (in-depth explanations)</option>
                    </Field>
                    <ErrorMessage name="detailLevel" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Continue
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          {/* Step 4: Completion */}
          {step === 4 && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Setup Complete!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your personalized AI tutor is ready to help you learn.
              </p>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Start Learning
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
