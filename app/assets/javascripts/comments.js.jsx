var CommentBox = React.createClass({
  loadCommentsFromServer: function(){
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data){
        this.setState({data:data});
      }.bind(this),
      error: function(xhr, status, err){
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment){
    var comments = this.state.data;
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: "Post",
      data: {comment: comment},
      success: function(data){
        this.setState({data, data});
      }.bind(this),
      error: function(xhr, status, err){
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function(){
    return {data: []};
  },
  componentDidMount: function(){
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function (){
    return (
      <div className="commentBox">
        <h2>What up in the Hive Mind?!</h2>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});


var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment) {
      return (
        <Comment author={comment.author}>
          {comment.text}
        </Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  handleSubmit: function(event) {
    event.preventDefault();
    var author = React.findDOMNode(this.refs.author).value.trim();
    var text = React.findDOMNode(this.refs.text).value.trim();
    if (!text || !author) {
      return
    }
    this.props.onCommentSubmit({author: author, text: text});
    React.findDOMNode(this.refs.author).value = "";
    React.findDOMNode(this.refs.text).value = "";
    return
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Give me your name!" ref="author" />
        <input type="text" placeholder="Buzz here!" ref="text" />
        <input type="submit" value="Buzz on!" />
      </form>
    );
  }
});

var Comment = React.createClass({
  render: function() {
    var converter = new Showdown.converter()
    var rawMarkup = converter.makeHtml(this.props.children.toString(), {sanitize: true});
    return (
      <div className = "comment">
        <h2 className = "commentAuthor">{this.props.author}</h2>
        <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
    );
  }
});

$(function(){
  var $content = $("#content");
  if ($content.length > 0){
    React.render(
      <CommentBox url="comments.json" pollInterval={2000} />,
      document.getElementById('content')
    );
  }
})
