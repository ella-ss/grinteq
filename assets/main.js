"use strict";

$(window).on('load', function () {
  // get an array with options of clicked variant (ie value: 'Black', index: 'option1')
  function getVariantFromSwatches() {
    let variantArr = [];
    $('.product-option input[type=radio]').map(function (i, el) {
      if ($(el).is(':checked')) {
        variantArr.push({
          value: $(el).val(),
          index: $(el).attr('data-index')
        });
      }
    });
    return variantArr;
  }

  // update URL
  function updateHistoryState(variant) {
    if (!history.replaceState || !variant) {
      return;
    }
    let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?variant=" + variant.id;
    window.history.replaceState({
      path: newurl
    }, "", newurl);
  }

  //plus btn
  $('.add').on('click', function () {
    $(this).prev().val(+$(this).prev().val() + 1);
  });
  //minus btn
  $('.sub').on('click', function () {
    if ($(this).next().val() > 1) {
      if ($(this).next().val() > 1) $(this).next().val(+$(this).next().val() - 1);
    }
  });

  //change class for swatch
  $('.swatch').click(function () {
    $('.swatch').removeClass('active');
    $(this).addClass('active');
  });
  function update_variant_id(variant) {
    $('#variant_id').val(variant);
  }
  function update_slider_image(variantImg) {
    let slideIndex = $('#' + variantImg).attr('data-index');
    $('.product-slider').slick('slickGoTo', slideIndex - 1);
  }
  function update_add_to_cart_text(variant) {
    let addToCart = $('#addToCart');
    if (variant.available == false) {
      addToCart.attr('disabled', true);
      addToCart.text('Sold Out');
    } else {
      addToCart.attr('disabled', false);
      addToCart.text('Add to Cart');
    }
  }
  function updateMasterVariant(variant) {
    let masterSelect = $('.product-form__variants');
    masterSelect.val(variant.id);
  }
  $('input[type=radio]').on('change', function () {
    let selectedValues = getVariantFromSwatches();
    let variants = window.product.variants;
    let found = false;
    variants.forEach(function (variant) {
      let satisfied = true;
      let options = variant.options;
      selectedValues.forEach(function (option) {
        if (satisfied) {
          satisfied = option.value === variant[option.index];
        }
      });
      if (satisfied) {
        found = variant;
      }
    });
    update_add_to_cart_text(found);
    update_variant_id(found.id);
    update_slider_image(found.featured_image.id);
    updateMasterVariant(found);
    updateHistoryState(found);
  });
  $('.product-slider').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    cssEase: 'linear',
    asNavFor: '.product-slider-nav'
  });
  $('.product-slider-nav').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    asNavFor: '.product-slider',
    dots: false,
    centerMode: true,
    focusOnSelect: true,
    prevArrow: "<button type='button' class='slick-prev p-slider-btn' id='pro_previous'><svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-chevron-left'><polyline points='15 18 9 12 15 6'/></svg></button>",
    nextArrow: "<button type='button' class='slick-next p-slider-btn' id='pro_next'><svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-chevron-right'><polyline points='9 18 15 12 9 6'/></svg></button>"
  });
});