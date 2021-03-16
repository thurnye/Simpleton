

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
