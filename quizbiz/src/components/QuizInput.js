import React, { Component } from 'react';
import { graphqlOperation, API } from 'aws-amplify';
import retry from 'async-retry';
import _ from 'lodash';
import { Modal, } from 'semantic-ui-react';

import QuestionForm from './QuestionForm';

const ActivateInput = (
    <span>Add a Question</span>
)

const QNewQuiz = `
mutation (
  $title: String!,
  ) {
  createQuiz(input: {
    title: $title
  })
  {
   id
   title
  }
}`;

const QNewQuestion = `
mutation (
  $text: String!,
  $explanation: String,
  $quizId: ID,
  ) {
  createQuestion(input: {
    text: $text,
    explanation: $explanation,
    quizQuestionsId: $quizId
  })
  {
   id
   text
   explanation
   }
}`;

const QNewAnswer = `
mutation (
  $text: String,
  $correct: Boolean,
  $questionId: ID
  ) {
  createAnswer(input: {
    text: $text,
    correct: $correct,
    answerQuestionId: $questionId
  })
  {
   id
   }
}`;

const GqlRetry = async (query, variables) => {
    return await retry(
        async bail => {
            console.log('Sending GraphQL operation', {query: query, vars: variables});
            const response = await API.graphql(graphqlOperation(query, variables))
            console.log('GraphQL result', {result: response, query: query, vars: variables})
            return response
        },
        {
            retries: 10,
        }
    )
};
        
class QuizInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            correctAnswer: null,
        };
    }

    submitNewQuestion = async (input) => {
        console.log('New question submission', {event: input})
        let quizId = input.quizId
        if (input.quizTitle !== null) {
            const resp = await GqlRetry(QNewQuiz, {title: input.quizTitle});
            quizId = resp.data.createQuiz.id;
        }
        const newQ = await GqlRetry(QNewQuestion, {
            text: input.questionText,
            explanation: input.questionExplanation || '',
            quizId: quizId,
        })
        _.map(
            [input.answerText1, input.answerText2, input.answerText3, input.answerText4],
            (ans, idx) => {
                if (ans === null) return
                GqlRetry(QNewAnswer, {
                    questionId: newQ.data.createQuestion.id,
                    text: ans,
                    correct: input.correctAnswer === 'answerText' + (idx+1),
                })
            }
        )
    }

    render() {
        return (
            <Modal
                open={this.props.modalActive}
                onClose={this.props.onClose}
                trigger={ActivateInput}
            >
                <Modal.Header>Create a Question</Modal.Header>
                <Modal.Content>
                    <QuestionForm quizzes={this.props.quizzes} submit={this.submitNewQuestion}/>
                </Modal.Content>
            </Modal>
        )
    }
}

export default QuizInput;
