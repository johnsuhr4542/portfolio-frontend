import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from 'axios';

import domain from '../lib/url';
import { Write } from '../components';
import * as userActions from '../store/modules/user';
import { isValid } from '../lib/token';

class WriteContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      content: ''
    }
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleContentChange = this.handleContentChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.checkToken = this.checkToken.bind(this);
  }

  componentWillMount = () => {
    const { logged } = this.props.user;
    const { history } = this.props;
    if (!logged) {
      window.alert('로그인이 필요합니다');
      history.push('/login');
    }
  }

  handleTitleChange = e => {
    this.setState({
      title: e.target.value
    });
  }

  handleContentChange = (e, editor) => {
    this.setState({
      content: editor.getData()
    });
  }

  handleSubmit = e => {
    e.preventDefault();

    const { logged } = this.props.user;
    if (!logged) {
      window.alert('권한이 없습니다.');
      return;
    }

    this.checkToken();

    const { accessToken } = this.props.user.tokens;
    
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }

    const { username } = this.props.user.userInfo;
    const { title, content } = this.state;
    const param = {
      author: {
        username: username
      },
      title: title,
      content: content
    }

    axios
      .post(`${domain}/article`, param, config)
      .then(res => {
        const id = res.data;
        const { history } = this.props;
        window.alert('글 등록에 성공했습니다.');
        history.push(`/detail/${id}`);
      })
      .catch(err => {
        window.alert('글 작성에 실패했습니다.');
        console.log(err);
      });

  }

  // check access token and if expired, try to reissue by using refresh token
  // preform synchronously
  checkToken = async () => {
    const { accessToken, refreshToken } = this.props.user.tokens;
    const { history, UserActions } = this.props;
    
    if (!accessToken) return;

    if (!isValid(accessToken)) {
      await UserActions.reissue(refreshToken)
      .then(() => {/* do nothing */})
      .catch(() => {
        UserActions.logout();
        history.push('/main');
      });
    }
  }

  render() {
    const { title, content } = this.state;
    const { handleTitleChange, handleContentChange, handleSubmit } = this;
    const { username } = this.props.user.userInfo;
    return (
      <Write
        author={ username }
        title={ title }
        content={ content }
        onTitleChange={ handleTitleChange }
        onContentChange={ handleContentChange }
        onSubmit={ handleSubmit }
      />
    )
  }
}

export default connect(
  state => ({
    user: state.user
  }),
  dispatch => ({
    UserActions: bindActionCreators(userActions, dispatch)
  })
)(WriteContainer);