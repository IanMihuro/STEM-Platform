import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";

import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";
import * as ROLES from "../../constants/roles";
import {
  Form,
  Button,
  Grid,
  Header,
  Message,
  Checkbox
} from "semantic-ui-react";

const SignUpPage = () => (
  <Grid centered columns={2}>
    <Grid.Column>
      <Header as="h2" textAlign="center">
        Sign Up
      </Header>
      <SignUpForm />
    </Grid.Column>
  </Grid>
);

const INITIAL_STATE = {
  username: "",
  email: "",
  passwordOne: "",
  passwordTwo: "",
  isAdmin: false,
  isTeacher: false,
  isStudent: false,
  error: null,
  isLoading: false
};

const ERROR_CODE_ACCOUNT_EXISTS = "auth/email-already-in-use";

const ERROR_MSG_ACCOUNT_EXISTS = `
  An account with this E-Mail address already exists.
  Try to login with this account instead. If you think the
  account is already used from one of the social logins, try
  to sign in with one of them. Afterward, associate your accounts
  on your personal account page.
`;

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const {
      username,
      email,
      passwordOne,
      isAdmin,
      isTeacher,
      isStudent
    } = this.state;
    const roles = {};

    this.setState({
      isLoading: true
    });

    if (isAdmin) {
      roles[ROLES.ADMIN] = ROLES.ADMIN;
    }

    if (isTeacher) {
      roles[ROLES.TEACHER] = ROLES.TEACHER;
    }

    if (isStudent) {
      roles[ROLES.STUDENT] = ROLES.STUDENT;
    }

    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {
        // Create a user in your Firebase realtime database
        return this.props.firebase.user(authUser.user.uid).set({
          username,
          email,
          roles // Add roles here
        });
      })
      .then(() => {
        return this.props.firebase.doSendEmailVerification();
      })
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
          error.message = ERROR_MSG_ACCOUNT_EXISTS;
        }

        this.setState({ error });
      })
      .finally(() => this.setState({ isLoading: false }));

    event.preventDefault();
  };

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onChangeCheckboxAdmin = () => {
    this.setState({ isAdmin: !this.state.isAdmin });
  };

  onChangeCheckboxTeacher = () => {
    this.setState({ isTeacher: !this.state.isTeacher });
  };

  onChangeCheckboxStudent = () => {
    this.setState({ isStudent: !this.state.isStudent });
  };

  render() {
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      isAdmin,
      isTeacher,
      isStudent,
      error,
      isLoading
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === "" ||
      email === "" ||
      username === "";

    return (
      <div>
        {error && (
          <Message negative>
            <p>{error.message}</p>
          </Message>
        )}
        <Form onSubmit={this.onSubmit}>
          <Form.Field>
            <label>Username</label>
            <input
              name="username"
              value={username}
              onChange={this.onChange}
              type="text"
              placeholder="Full Name"
            />
          </Form.Field>
          <Form.Field>
            <label>Email</label>
            <input
              name="email"
              value={email}
              onChange={this.onChange}
              type="text"
              placeholder="Email Address"
            />
          </Form.Field>
          <Form.Group widths="equal">
            <Form.Field>
              <label>Password</label>
              <input
                name="passwordOne"
                value={passwordOne}
                onChange={this.onChange}
                type="password"
                placeholder="Password"
              />
            </Form.Field>
            <Form.Field>
              <label>Confirm Password</label>
              <input
                name="passwordTwo"
                value={passwordTwo}
                onChange={this.onChange}
                type="password"
                placeholder="Confirm Password"
              />
            </Form.Field>
          </Form.Group>
          <Form.Field>
            <Checkbox
              label="Admin"
              name="isAdmin"
              onChange={this.onChangeCheckboxAdmin}
              checked={isAdmin}
            />
            <Checkbox
              label="Teacher"
              name="isTeacher"
              onChange={this.onChangeCheckboxTeacher}
              checked={isTeacher}
            />
            <Checkbox
              label="Student"
              name="student"
              onChange={this.onChangeCheckboxStudent}
              checked={isStudent}
            />
          </Form.Field>
          <Button
            primary
            disabled={isInvalid}
            type="submit"
            loading={isLoading}
          >
            Sign Up
          </Button>
        </Form>
      </div>
    );
  }
}

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
);

const SignUpForm = withRouter(withFirebase(SignUpFormBase));

export default SignUpPage;

export { SignUpForm, SignUpLink };
