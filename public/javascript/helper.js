

$('.owl-carousel').owlCarousel({
    loop:true,
    margin:50,
    responsiveClass:true,
    nav: false,
    responsive:{
        0:{
            items:1,
            nav:true
        },
        600:{
            items:3,
            nav:false
        },
        1000:{
            items:5,
            nav:true,
        }
    }
})



const minus = document.querySelector('.minus');
const plus = document.querySelector('.plus');
const quantity  = document.querySelector('.quantity');


let value = quantity.value;
const userInput = (e) => {
    value = parseInt(e.target.value);
}

quantity.onchange = userInput;


if (parseInt(quantity.value) <= 1){
    minus.disabled = true;
}else {
  minus.disabled = false;
}



const remove = (e) => {
 quantity.value = parseInt(quantity.value) - 1
  if (parseInt(quantity.value) <= 1){
    minus.disabled = true;
  }else {
    minus.disabled = false;
  }
  
}
const add = (e) => {
 quantity.value = parseInt(quantity.value) + 1

  if (parseInt(quantity.value) <= 1){
    minus.disabled = true;
  }else {
    minus.disabled = false;
  }
}







minus.addEventListener('click', remove)
plus.addEventListener('click', add)