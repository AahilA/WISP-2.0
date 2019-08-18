/* eslint-disable no-unused-expressions */
/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
/* eslint-disable no-return-assign */
/* eslint-disable new-cap */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import * as Survey from 'survey-react';
import 'survey-react/survey.css';
import '../styling/Style.CSS';
import SideNavBar from './SideNavBar';
import NavBar from './NavBar';

const jsPDF = require('jspdf');

Survey.Survey.cssType = 'bootstrap';

const getSurveys = gql`

query getSurveys{
  getSurveys{
    _id
    json
    date
    finished
  }
}

`;

const customers = gql`

query customers {
  customers{
    answers{
      template
      isComplete
      answer
    }
    username
    _id
  }
}
`;
const sendAnswers = gql`

    mutation sendAnswers($username:String!, $isComplete:Boolean!, $answer:String!, $template:String!){
        sendAnswers(
            username:$username,
            template:$template,
            isComplete:$isComplete,
            answer:$answer,
        ){
            _id
        }
    }

`;


const createPDF = (survey, username, template) => {
  const QA = (survey.getAllQuestions()).map(qModel => ({ question: qModel.fullTitle, answer: qModel.displayValue }));
  const doc = new jsPDF();
  doc.setFontSize(40);
  doc.text(`${username}'s results`, 55, 20);
  doc.setFontSize(30);
  doc.text(`Questionnaire ID: ${template}`, 20, 35);
  doc.setFontSize(20);


  QA.forEach((element, i) => {
    doc.text(10, 50 + (i * 20),
      `Question: ${element.question
      }\nAnswer: ${element.answer}`);
  });
  doc.save('a4.pdf');
};


class App extends Component {
  constructor(props) {
    super(props);
    this.displayLogInfo = <div>
      <label className = "promptLabel">
        Username:
        <input type="textarea" ref={input => this.username = input} className = "textarea"/><br/>
      </label>
      <br/>
      <label className = "promptLabel">
        ID:
        <input type="textarea" ref={input => this.currID = input} className = "textarea"/>
      </label>
      <br/>
      <br/>
    </div>;
    this.child = React.createRef();
    this.state = {
      showForm: false,
      username: '',
      currentJson: '',
      currentAnsJson: null,
      survey: null,
      displayPanel: [],
      jsonObj: null,
      logInfo: this.displayLogInfo,
      showSubmit: true,
      showAnother: false,
      template: '',
      curPageNo: 0,
      totalPage : 0,
      curPage : 0
    };

    this.onComplete = this.onComplete.bind(this);
    this.onPartialSend = this.onPartialSend.bind(this);
    this.renderPanel = this.renderPanel.bind(this);
    this.navigatePanel = this.navigatePanel.bind(this);
    this.anotherQN = this.anotherQN.bind(this);
    this.returnCurPageNo = this.returnCurPageNo.bind(this);
    this.prevPage = this.prevPage.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.setTotalPages = this.setTotalPages.bind(this)
  }

  onComplete() {
    // Write survey results into database
    this.setState({
      showForm: false,
    });
    this.props.sendAnswers({
      variables: {
        username: this.state.username,
        isComplete: true,
        template: this.state.template,
        answer: JSON.stringify((this.state.survey.getAllQuestions()).map(qModel => JSON.stringify({ question: qModel.fullTitle, answer: qModel.displayValue }))),
      },
      refetchQueries: [
        'customers',
      ],
    }).catch((error) => {
      console.log(error);
    });
    createPDF(this.state.survey, this.state.username, this.state.template);
  }

  onPartialSend() {
    // Write survey results into database
    if (this.state.survey === null) { console.log('on pertial send'); }
    const jsonString = JSON.stringify(this.state.survey.data);
    this.props.sendAnswers({
      variables: {
        username: this.state.username,
        isComplete: false,
        template: this.state.template,
        answer: jsonString,
      },
    }).catch((error) => {
      console.log(error);
    });
    console.log(`Survey results: ${JSON.stringify(this.state.survey.data)}`);
  }

  navigatePanel(number) {
    this.state.survey.currentPage = this.state.survey.visiblePages[number];
    if (number + 1 === this.state.survey.visiblePageCount) {
      document.getElementById('nextButton').setAttribute('content', 'FINISH');
      document.getElementById('nextButton').innerHTML = 'FINISH';
    }
    if (number === 0) {
      document.getElementById('prevButton').setAttribute('class', 'hide');
    } else {
      document.getElementById('nextButton').setAttribute('content', 'NEXT');
      document.getElementById('nextButton').innerHTML = 'NEXT';
      document.getElementById('prevButton').setAttribute('class', 'prev');
    }
    this.setState({curPage : number})
  }

  prevPage() {
    // this.child.current.changeNavBarOnClick(false);
    const curPage = this.state.survey.currentPageNo;
    this.setState({
      curPageNo: curPage - 1,
    });
    document.getElementById('nextButton').setAttribute('content', 'NEXT');
    document.getElementById('nextButton').innerHTML = 'NEXT';
    console.log('curpage', curPage);
    if (curPage - 1 === 0) {
      document.getElementById('prevButton').setAttribute('class', 'hide');
    }
    this.state.survey.currentPage = this.state.survey.visiblePages[curPage - 1];
    this.setState({curPage : this.state.curPage-1})
    this.onPartialSend();
  }

  nextPage() {
    // this.child.current.changeNavBarOnClick(true);
    const curPage = this.state.survey.currentPageNo;
    this.setState({
      curPageNo: curPage + 1,
    });
    document.getElementById('prevButton').setAttribute('class', 'prev');
    if (curPage + 1 === this.state.survey.visiblePageCount) {
      this.onComplete();
    }
    if (curPage + 2 === this.state.survey.visiblePageCount) {
      document.getElementById('nextButton').setAttribute('content', 'FINISH');
      document.getElementById('nextButton').innerHTML = 'FINISH';
    }
    this.state.survey.currentPage = this.state.survey.visiblePages[curPage + 1];
    this.setState({curPage : this.state.curPage+1})
    this.onPartialSend();
  }


  renderPanel(json) {
    this.setState({
      survey: new Survey.Model(JSON.parse(json)),
    }, () => {
      this.setState({
        displayPanel: [
          <div className = "survey">
            <Survey.Survey
              model= {this.state.survey}
              sendResultOnPageNext={true}
              onPartialSend={this.onPartialSend}
              onComplete={this.onComplete}
              showNavigationButtons = {false}
              data={this.state.currentAnsJson === undefined ? null : JSON.parse(this.state.currentAnsJson)}
              showCompletedPage = "true"
              showQuestionNumbers = "true"
            />
            <br/>
            <button onClick = {this.prevPage} id = "prevButton" className = "prev">PREV</button>
            <button onClick = {this.nextPage} id = "nextButton" className = "next">NEXT</button>
          </div>,
        ],
      });
    });
  }

  returnPageNo() {
    return this.state.survey.currentPageNo;
  }

  returnCurPageNo() {
    if (this.state.survey != null) {
      console.log('survey not null', this.state.survey.currentPageNo);
    } else {
      console.log('null survey');
    }
  }

  anotherQN() {
    this.setState({
      logInfo: this.displayLogInfo,
      showSubmit: true,
      showForm: false,
      showAnother: false,
    });
  }

  // not working right now
  changeTextOnDropdown(event) {
    console.log('enter change text');
    console.log(event.target.value);
    if (event.target.value == 'cornell') {
      console.log('cornell');
      document.getElementsByClassName('dropdown-content').value = 'about cornell';
    } else if (event.target.value == 'security') {
      console.log('secu');
      document.getElementsByClassName('dropdown-content').value = 'security';
    } else if (event.target.value == 'purpose') {
      console.log('purpose');
      document.getElementsByClassName('dropdown-content').value = 'purpose';
    } else {
      document.getElementsByClassName('dropdown-content').value = '';
    }
  }

  renderNavBar() {
    return <NavBar
            onsendPartial = {this.onPartialSend}
            pages = {this.state.jsonObj.pages}
            navigatePanel = {this.navigatePanel}
            renderPanel = {this.renderPanel}
            rawSurvey = {this.state.jsonObj}
            returnCurPageNo = {this.returnCurPageNo}
            curPageNo = {this.state.curPageNo}
            survey = {this.state.survey}
            setTotalPages = {this.setTotalPages}
            // ref={this.child}
          />;
  }

  setTotalPages(number){
    this.setState({
      totalPage : number
    })
  }

  render() {
    if (this.props.loadingOne || this.props.loadingTwo || this.props.loadingThree) return null;

    const submit = () => {
      if (this.props.getSurveys.some(survey => this.currID.value === survey._id)) {
        const { finished, json } = this.props.getSurveys.find(survey => survey._id === this.currID.value);
        if (finished) {
          createPDF(new Survey.Model(JSON.parse(json)).data = this.props.customers.find(ans => ans.username === this.username.value)).answers.answer;
          return;
        }

        if (this.props.customers.some(ans => ans.username === this.username.value)) {
          const curJson = (this.props.getSurveys.find(survey => survey._id === this.currID.value)).json;
          this.setState({
            showForm: true,
            username: this.username.value,
            currentJson: curJson,
            currentAnsJson: (this.props.customers.find(ans => ans.username === this.username.value)).answers.answer,
            survey: new Survey.Model(JSON.parse(curJson)),
            jsonObj: JSON.parse(JSON.parse(JSON.stringify(curJson))),
            template: this.currID.value,
          }, () => {
            console.log('this survey', this.state.survey);
            this.currID.value = '';
            this.username.value = '';
            this.setState({
              logInfo: null,
              showSubmit: false,
              showAnother: true,
            });
          });
        } else {
          const curJson = (this.props.getSurveys.find(survey => survey._id === this.currID.value)).json;
          this.setState({
            showForm: true,
            username: this.username.value,
            currentJson: curJson,
            currentAnsJson: null,
            survey: new Survey.Model(JSON.parse((this.props.getSurveys.find(survey => survey._id === this.currID.value)).json)),
            jsonObj: JSON.parse(JSON.parse(JSON.stringify(curJson))),
            template: this.currID.value,
            showAnother: true,
          }, () => {
            console.log(this.state.currentAnsJson);
            this.currID.value = '';
            this.username.value = '';
          });
        }
      }
    };

    return (
            <div>
              <ul className = "topnav">
                <li><button>Log In</button></li>
                <li><button>Information</button></li>
                <li><button>Contact</button></li>
              </ul>
              <div className = {this.state.showAnother ? 'hide' : 's'}>
                <header className = "topHeader">
                  <h1>Customer Side</h1>
                  <div className = "labels">
                    <label value = "security" onClick = {() => this.changeTextOnDropdown}>Security Department</label>
                    <label value = "purpose" onClick = {() => this.changeTextOnDropdown}>Purpose</label>
                    <div className="dropdown-content">
                      <h1>Hello World!</h1>
                    </div>
                  </div>
                </header>
                <img
                  className = "cornellLogo"
                  src = "https://static.wixstatic.com/media/865a93_ab56eb87513f4ad6933e99f6a538e581~mv2_d_2000_2000_s_2.png" alt = "logo" ></img>
                <h2 className = "cornellName">Cornell University</h2>
                <div className = "sideNotes">
                  <h3>More Information</h3>
                  <h5>something</h5>
                  <h4>content here</h4>
                  <hr/>
                  <h5>something else</h5>
                  <h4>content here</h4>
                  <hr/>
                  <h5>more IT</h5>
                </div>
                {this.state.logInfo}
                <button onClick={submit} className = {this.state.showSubmit ? 'submit' : 'hide'}>Submit</button>
              </div>
              {this.state.showForm ? (
                  <div className = "rowC">
                    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css"></link>
                    {this.renderNavBar()}
                    <div>
                      <h2 className = "progressLabel">Page {this.state.curPage+1} of {this.state.totalPage} </h2>
                      {this.state.displayPanel}
                    </div>
                  </div>
              ) : null }
              <br></br>
              <button onClick = {this.anotherQN} className ={this.state.showAnother ? 'submitAnother' : 'hide'}>Answer Another Questionnaire</button>
            </div>
    );
  }
}


export default compose(
  graphql(getSurveys, { props: ({ data }) => ({ ...data }) }),
  graphql(customers, { props: ({ data }) => ({ ...data }) }),
  graphql(sendAnswers, {
    name: 'sendAnswers',
  }),
)(App);
