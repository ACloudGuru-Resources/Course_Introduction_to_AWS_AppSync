import React from 'react';
import { Icon, Label, Form, Radio, Grid, Segment, Header } from 'semantic-ui-react';

class Question extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comment: '',
            answered: false,
            value: null,
            correct: false,
        }
    }

    // enforce the radio button getting checked
    updateRadio = (e, { value }) => this.setState({ value });

    submitAnswer = (e) => {
        this.props.question.answers.items.map(a => {
            if (this.state.value === a.id) {
                // user was right, set this question as correctly answered
                if (a.correct) {
                    this.setState({correct: true});
                    this.props.rightAnswer()
                }
                // show the comment
                if (a.comment) {
                    this.setState({ comment: a.comment })
                } else {
                    if (a.correct) {
                        this.setState({ comment: "Great work!" })
                    } else {
                        this.setState({ comment: "Sorry, that's not it." })
                    }
                }
            }
            return (this.state.value === a.id && a.correct)
        });
        this.setState({ answered: true });
        this.props.answer(this.props.question.id)
    };

    render() {
        return (
            <Grid.Row stretched key={this.props.question.id + '-main'}>
                <Grid.Column width={6}>
                    <Header as='h3' className="middle aligned" key={this.props.question.id}>
                        {this.props.question.text}
                    </Header>
                    {this.state.answered &&
                    <Segment color={this.state.correct ? 'green' : 'red'}>
                        {this.props.question.explanation === null ?
                            <p>{this.state.correct ? "Great work!" : "Sorry, that's not right"}</p>
                        :
                            <p>{this.props.question.explanation}</p>
                        }
                        {this.props.question.links &&
                        <ul>
                            {this.props.question.links.map((l, index) =>
                                    <li key={index}><a target="_blank" rel="noopener noreferrer" href={l}>{l}</a></li>
                            )}
                        </ul>
                        }
                    </Segment>
                    }
                    <div>
                        {(this.props.question.tags || []).map((t) => (
                            <Label key={this.props.question.id + t} color='teal'>
                                {t}
                                <Label.Detail>Topic</Label.Detail>
                            </Label>
                        ))}
                    </div>
                </Grid.Column>
                <Grid.Column width={10}>
                    <Form onSubmit={this.submitAnswer}>
                        {
                            this.props.question.answers.items.map(a => (
                                <Segment key={a.id}>
                                    <Form.Field
                                        control={Radio}
                                        disabled={this.state.answered}
                                        label={a.text}
                                        checked={this.state.value === a.id}
                                        value={a.id}
                                        onChange={this.updateRadio}
                                    />
                                </Segment>
                            ))
                        }
                        <Form.Group inline>
                            <Form.Button primary icon labelPosition='right' disabled={this.state.answered}>
                                <Icon name='right arrow'/>
                                Submit
                            </Form.Button>
                        </Form.Group>
                    </Form>
                </Grid.Column>
            </Grid.Row>
        );
    }
}

export default Question;
