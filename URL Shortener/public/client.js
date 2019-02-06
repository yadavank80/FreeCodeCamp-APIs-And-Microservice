// function generateShortURL(){
//   var inputURL = document.getElementById('inputURL').value;
//   console.log("URL: " + inputURL);
  
//   var data ={
//     "url_to_shorten": inputURL
//   }
  
//   var shortURLRequest = new XMLHttpRequest();
//   shortURLRequest.open('post', 'https://berry-bladder.glitch.me/api/shorturl/new');
//   shortURLRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//   shortURLRequest.send(JSON.stringify(data));
// }