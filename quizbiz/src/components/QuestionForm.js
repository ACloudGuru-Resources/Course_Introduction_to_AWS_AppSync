import React, { Component } from 'react';
import _ from 'lodash';
import { Icon, Form, } from 'semantic-ui-react';

class QuestionForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            quizTitle: null,
            quizId: null,
            correctAnswer: null,
            questionText: null,
            questionExplanation: null,
            answerText1: null,
            answerText2: null,
            answerText3: null,
            answerText4: null,
            loading: false
        };
    }

    submit = () => {
        this.props.submit(this.state)
        this.setState({ loading: true })
    }

    updateCheck = (e, { value }) => {
        console.log({ event: e, value: value })
        this.setState({ correctAnswer: value })
    }

    updateText = (e, { name, value }) => {
        console.log({ event: e, name: name, value: value })
        this.setState({ [name]: value })
    }

    render() {
        return (
            <Form onSubmit={this.submit}>
                <Form.TextArea name={'questionText'} onChange={this.updateText} ></Form.TextArea>
                <h3>Answers</h3>
                {_.map([1, 2, 3, 4], i => (
                    <Form.Group inline key={'id-' + i}>
                        <Form.Radio
                            disabled={false}
                            label=''
                            checked={this.state.correctAnswer === 'answerText' + i}
                            onClick={this.updateCheck}
                            value={'answerText' + i}
                        />
                        <Form.Input label={'Choice ' + i} onChange={this.updateText} name={'answerText' + i}></Form.Input>
                    </Form.Group>
                ))}
                <Form.TextArea label='Why is this correct?' name={'questionExplanation'} onChange={this.updateText} ></Form.TextArea>
                <Form.Group widths='equal' >
                    <Form.Dropdown
                        search
                        selection
                        label="Add to quiz"
                        name="quizId"
                        placeholder="Choose One"
                        onChange={this.updateText}
                        options={_.map(_.sortBy(this.props.quizzes, 'title'), (v) => { return { text: v.title, value: v.id } })}
                    />
                    <Form.Input
                        label='Or create a new quiz'
                        name='quizTitle'
                        onChange={this.updateText} >
                    </Form.Input>
                </Form.Group>
                <Form.Button
                    primary
                    icon
                    labelPosition='right'
                    disabled={this.state.loading || this.state.correctAnswer === null || this.state.questionText === null}
                >
                    <Icon name='right arrow' />
                    Submit
                            </Form.Button>
            </Form>
        )
    }
}

export default QuestionForm;