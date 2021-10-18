import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from '../service/api-service.service';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-outlethome',
  templateUrl: './outlethome.page.html',
  styleUrls: ['./outlethome.page.scss'],
})
export class OutlethomePage implements OnInit {
  
  public userDetails : any = {id:"63",name:"Rajeev Ranjan Prakash",email:"rrpit9@gmail.com",mobile:"8804809613",password:"ab1e5cb87bca828b54a4a24c2b37ea8f",image:"",gender:"0",dob:null,otp:"123456",is_verified:"1",is_active:"1",is_deleted:"0"};
  // public shopDetails : any = {id:"10",name:"Liquidity Outlet_2",image:"http://demo91.co.in/dev/liquidity/assets/upload/shops/1613808061_Outlet_Image_2.jpg",address:"Pushpanjali Chamber, Second Floor,Kolkata",city_id:"1",email:"outlettwo@liquidity.in",password:"e10adc3949ba59abbe56e057f20f883e",phone:"9999999999",rating:"0",review:"",offer_rate:"0",offer_text:"OFFERS Coming Soon !!!",house_rules:"Please Visit Terms and Condition Page www.liquiditybars.in",is_active:"1",is_deleted:"0"};
  public shopDetails : any = {id:"12",name:"Liquidity Outlet_4",image:"http://demo91.co.in/dev/liquidity/assets/upload/shops/1613810148_Outlet_Image_4.jpg",address:"Pushpanjali Chamber, Third Floor, Kolkata","city_id":"1","email":"outletfour@liquidity.in",password:"e10adc3949ba59abbe56e057f20f883e",phone:"9999999999",rating:"0",review:"",offer_rate:"0",offer_text:"OFFERS Coming Soon !!!",house_rules:"Please Visit Terms and Condition Page www.liquiditybars.in",is_active:"1",is_deleted:"0"}
  
  public cartItem: {cart: CARTSITEM[];};
  public currentSuperCategory = 'liquor';
  public currentLiquorInfo : any = '';

  public deviceId : any = '';

  constructor(private _apiService : ApiServiceService,private _router:Router) {
    this.cartItem = {cart : []};
      // getting Unique Device Id
      this.deviceId = 'deviceIdIonicUser'+this.userDetails.id;
      console.log('Device Id :=> '+this.deviceId);
  }

  ngOnInit() {
    this.changeSuperCategory('liquor'); // clicking the Liquor Section by default
  }

  ionViewWillEnter(){// for back coming to again this Page
    this.existingCartCheck(); // checking the Existing cart
  }

  changeSuperCategory(categoryType){
    this.currentSuperCategory = categoryType;
    if(categoryType == 'liquor'){
      this.getLiquorSubCategoryInfo(1); // for Liquor Category
    }else if(categoryType == 'food'){
      this.getOtherAllProductInfo(2,'food'); // for Food Product Info
    }else if(categoryType == 'soft-beverage'){
      this.getOtherAllProductInfo(3,'soft-beverage'); // for Soft Beverage Product Info
    }else if(categoryType == 'combo'){
      this.getOtherAllProductInfo(4,'combo'); // for Combo Product Info
    }
  }
  
  public liquorSubCategoryInfo : any = [];
  getLiquorSubCategoryInfo(categoryId){
    this._apiService.getLiquorSubCategoryInfo(categoryId).subscribe(
      res => {
        if(res.status == 1 || res.status == '1'){
          this.liquorSubCategoryInfo = res.sub_categories;
          this.getLiquorProductInfo(this.liquorSubCategoryInfo[0]); // Getting the First Liquor prduct Info
        }
        // console.log('getLiquorSubCategoryInfo',res);
      },err => {
        // console.log('getLiquorSubCategoryInfo',err);
      }
    )
  }
  
  public liquorProductInfo : any = [];
  getLiquorProductInfo(liquorSubCategory){
    this.currentLiquorInfo = liquorSubCategory.name;
    this._apiService.getLiquorProductInfo(liquorSubCategory.id,this.shopDetails.id).subscribe(
      res => {
        if(res.status == 1 || res.status == '1'){
          this.liquorProductInfo = res.products;
        }
        // console.log('getLiquorProductInfo',res);
      },err => {
        // console.log('getLiquorProductInfo',err);
      }
    )
  }

  public foodProductInfo : any = [];
  public softBeverageProductInfo : any = [];
  public comboProductInfo : any = [];

  getOtherAllProductInfo(categoryId,categoryType){
    this._apiService.getOtherAllProductInfo(categoryId,this.shopDetails.id).subscribe(
      res => {
        if(res.status == 1 || res.status == '1'){
          if(categoryType == 'food'){
            this.foodProductInfo = res.products;
          }else if(categoryType == 'soft-beverage'){
            this.softBeverageProductInfo = res.products;
          }else if(categoryType == 'combo'){
            this.comboProductInfo = res.products;
          }
        }
        // console.log('getOtherAllProductInfo',res,categoryType);
      },err => {
        // console.log('getOtherAllProductInfo',err);
      }
    )
  }

  decreamentProductCounter(productInfo,categoryType){ // decareament the product
    var itemInfo = this.cartItem.cart.find(item => item.itemId === productInfo.id);
    if(itemInfo == undefined){}
    else{
      let currentQuantity = (parseInt(String(itemInfo.quantity)) - 1).toString();
      if(currentQuantity > '0'){
        itemInfo.quantity = (parseInt(String(itemInfo.quantity)) - 1).toString();
        itemInfo.calculatedPrice = String(parseFloat(itemInfo.currentPrice) * parseInt(itemInfo.quantity));
      }else if(currentQuantity <= '0'){
        itemInfo.quantity = '0';itemInfo.calculatedPrice = '0';
        this.cartItem.cart = this.cartItem.cart.filter(item => item.itemId !== productInfo.id); // removing the item from cart
      }
      this.updateCartItemToLocalStorage(); // updating the Cart in to LocalStorage
      this.addItemToCartToServer(itemInfo,categoryType); // updating the cart into Server
    }
  }

  increamentProductCounter(productInfo,categoryType){ // increament the Product
    var itemInfo = this.cartItem.cart.find(item => item.itemId === productInfo.id);
    if(itemInfo == undefined){
      let subCategoryName = '';
      if(categoryType == 'liquor'){
        subCategoryName = this.currentLiquorInfo;
      }
      itemInfo = {
        categoryType : categoryType,
        categoryId : productInfo.category_id,
        subCategoryId : productInfo.sub_category_id,
        subCategoryName : subCategoryName,
        outletId : this.shopDetails.id,
        outletName : this.shopDetails.name,
        outletRating : this.shopDetails.rating,
        outletImage : this.shopDetails.image,
        itemId : productInfo.id,
        itemName : productInfo.name,
        highPrice : productInfo.highest_price,
        lowPrice : productInfo.lowest_price,
        currentPrice : productInfo.current_price,
        quantity : '1',
        maxQuantity : '5',
        calculatedPrice : productInfo.current_price,
        description : productInfo.description,
      }
      this.cartItem.cart.push(itemInfo);
    }else{
      let nextQuantity = (parseInt(String(itemInfo.quantity)) + 1).toString();
      if(parseInt(nextQuantity) > parseInt(itemInfo.maxQuantity)){
        console.log('You can not add more than '+ itemInfo.quantity +' quantity');
      }else{
        itemInfo.quantity = nextQuantity;
        itemInfo.calculatedPrice = String(parseFloat(itemInfo.currentPrice) * parseInt(itemInfo.quantity));
      }
    }
    this.updateCartItemToLocalStorage(); // updating the Cart in to LocalStorage
    this.addItemToCartToServer(itemInfo,categoryType); // updating the cart into Server
  }

  totalCartValue = '0'; // Total Cart Value
  checkCurrentQuantityCount(productInfo){
    let value = this.cartItem.cart.find(item => item.itemId === productInfo.id);
    this.totalCartValue = this.cartItem.cart.reduce((accumulator:any, current:any) => parseFloat(accumulator) + parseFloat(current.calculatedPrice), 0);
    if(value == undefined){ // if product not found in the cart then quantity set to be zero
      return '0';
    }
    return value.quantity; // else return the Saved quantity
  }

  // Goto View cart Section
  switchToViewCart(){
    this.updateCartItemToLocalStorage();
    localStorage.setItem('userDetails',JSON.stringify(this.userDetails));
    localStorage.setItem('shopDetails',JSON.stringify(this.shopDetails));
    localStorage.setItem('userDeviceInfo',JSON.stringify(this.deviceId));
    if(this.cartItem.cart.length > 0){
      this._router.navigate(['outlethome/cart-info']);
    }else{
      console.log('You donot have item in your cart');
    }
    // Encrypting and Dcrypting the Cart Info
    // var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(this.cartItem.cart), 'secret key 123').toString();
    // console.log(ciphertext);
    // var bytes  = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
    // var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    // console.log(decryptedData);
  }

  
  addItemToCartToServer(itemDetails,categoryType){ // updating the Cart in to Server
    var isLiquor = '0';
    if(categoryType == 'liquor'){
      isLiquor = '1';
    }
    const mainForm = new FormData();
    mainForm.append('device_id',this.deviceId);
    mainForm.append('product_id',itemDetails.itemId);
    mainForm.append('product_name',itemDetails.itemName);
    mainForm.append('price',itemDetails.currentPrice);
    mainForm.append('quantity',itemDetails.quantity);
    mainForm.append('is_liquor',isLiquor);
    this._apiService.saveOrUpdateItemsToUserCart(mainForm).subscribe(
      res => {
        console.log(res);
      },err => {
        console.log(err);
      },
    )
  }

  updateCartItemToLocalStorage(){ // updating the Cart in to LocalStorage
    localStorage.setItem('allCartItems',JSON.stringify(this.cartItem.cart));
  }

  // Retriving the Existing Cart Which is Used Before
  existingCartCheck(){
    let existingCart = JSON.parse(localStorage.getItem('allCartItems'));
    if(existingCart != null){
      this.cartItem.cart = existingCart;
    }
  }
}

interface CARTSITEM {
  categoryType : string, // liquor, food, combo, soft-beverage
  categoryId : string,
  subCategoryId : string,
  subCategoryName : string,
  outletId : string,
  outletName : string,
  outletRating : string,
  outletImage : string,
  itemId : string,
  itemName : string,
  highPrice : string,
  lowPrice : string,
  currentPrice : string,
  quantity : string,
  maxQuantity : string,
  calculatedPrice : any,
  description : string,
}