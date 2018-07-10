//UI controller 
var UIcontroller = (function(){
    var DOMstring = {
        domType : '.add__type',
        domDes : '.add__description',
        domValue : '.add__value',
        domBtn : '.add__btn',
        domIncome : '.income__list',
        domExpense : '.expenses__list',
        domBudget : '.budget__value',
        domInc : '.budget__income--value',
        domExp : '.budget__expenses--value',
        domPer : '.budget__expenses--percentage',
        domContainer : '.container',
        domPercentagelabel : '.item__percentage',
        domMonthnYear : '.budget__title--month'
    };
    var formatNumber = function(num,type){
            var splitNum,dec,int;
            num = Math.abs(num);
            num = num.toFixed(2);
            splitNum = num.split('.'); 
            int = splitNum[0];
            if(int.length > 0 ){
                  int = int.substr(0,int.length-3)+''+int.substr(int.length-3,3);  
               }
            dec = splitNum[1];
            return (type === 'exp'? '-':'+')+' '+int+'.'+dec; 
    };
    
    //Select Active Individual
    var nodeListForEach = function(list,callBack){
        for(var i = 0;i < list.length ; i++){
            callBack(list[i],i);
        }
    };
    return{
        Getvalue : function(){
            return {
                type : document.querySelector(DOMstring.domType).value,
                des : document.querySelector(DOMstring.domDes).value,
                value : parseFloat(document.querySelector(DOMstring.domValue).value)
            }
        },
        GetDOM : function(){
            return DOMstring;
        },
        UIupdate : function(obj,type){
            var html,newHtml,element;
            if(type === 'inc'){
                element=DOMstring.domIncome;
               html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%des%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
               }else if(type === 'exp'){
                element=DOMstring.domExpense;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%des%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%des%',obj.des);
            newHtml = newHtml.replace('%value%',formatNumber( obj.value,type));
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        clearField : function(){
            var fields,fieldList;
            fields = document.querySelectorAll(DOMstring.domDes+','+DOMstring.domValue);
            fieldList = Array.prototype.slice.call(fields);
            fieldList.forEach(function(current,index,array){
               current.value="";
            });
            fieldList[0].focus();
        },
        UpdateBudgetUI:function(BudgetObj){
            var typeBudget;
            if(BudgetObj > 0){
                 typeBudget = 'inc'; 
            }else{
                typeBudget = 'exp';
            }
            document.querySelector(DOMstring.domBudget).textContent = formatNumber(BudgetObj.Budget,typeBudget);
            document.querySelector(DOMstring.domInc).textContent = formatNumber(BudgetObj.totalInc,'inc');
            document.querySelector(DOMstring.domExp).textContent = formatNumber(BudgetObj.totalExp,'exp');
            if(BudgetObj.Per > 0){
                document.querySelector(DOMstring.domPer).textContent = BudgetObj.Per+'%';
               }else{
                document.querySelector(DOMstring.domPer).textContent = '...';
            }
        },
        DeleteFrmUI:function(SelectID){
            var DomDel = document.getElementById(SelectID);
            DomDel.parentNode.removeChild(DomDel);
        },
        displayPercentage : function(percentage){
            var field = document.querySelectorAll(DOMstring.domPercentagelabel);
            nodeListForEach(field,function(current,index){
                if(percentage[index] > 0){
                    current.textContent = percentage[index]+'%';
                }else{
                    current.textContent = '---';
                }
            });
        },
        GetDate:function(){
            var curDate,year,month,AllMonth;
            AllMonth = ['Jan','Feb','Marc','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            curDate = new Date();
            year = curDate.getFullYear();
            month = curDate.getMonth();
            document.querySelector(DOMstring.domMonthnYear).textContent = AllMonth[month]+' '+year;
        },
        changeType:function(){
            var fields = document.querySelectorAll(
                DOMstring.domType+','+
                DOMstring.domDes+','+
                DOMstring.domValue);
            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            })
            document.querySelector(DOMstring.domBtn).classList.toggle('red');
        }    
    }       
})();

//Data Controller
var DataController = (function(){
    var Expense = function(id,des,value){
        this.id = id;
        this.des = des;
        this.value = value;
        this.per = -1;
    };
    
    Expense.prototype.calPercentage = function(totalInc){
        if(totalInc > 0){
            this.per = Math.round((this.value/totalInc)*100);    
        }else{
            this.per = -1;   
        }
    };
    
    Expense.prototype.getPer=function(){
        return this.per;
    };
    
    var Income = function(id,des,value){
        this.id = id;
        this.des = des;
        this.value = value;
    };
    
    var data = {
        allItems : {
          exp : [],
            inc : []
        }, 
        total : {
            exp : 0,
            inc : 0
        },
        Budget : 0,
        percentage : -1
    };
    
    var CalculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value;    
        });
        data.total[type] = sum;
    }
    
    return {
        addNewItem : function(type,des,value){
        var id,newItem;
        
        if(data.allItems[type].length > 0){
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else {
                id = 0;
            }
        
            //Check type inc pr exp
        if(type === 'inc'){
                newItem = new Income(id,des,value);
            }else if(type === 'exp'){
                newItem = new Expense(id,des,value);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        CalculateData:function(type){
         //total
            CalculateTotal('inc');
            CalculateTotal('exp');
        //Calculate Budget
            data.Budget = data.total.inc - data.total.exp;
        //Calculate Percentage 
            if(data.total.inc > 0){
                data.percentage = Math.round((data.total.exp/data.total.inc)*100);
               }else{
                data.percentage = -1 ;
            }
        },
        getBudget : function(){
          return{
              totalInc : data.total.inc,
              totalExp : data.total.exp,
              Budget : data.Budget,
              Per : data.percentage
          }  
        },
        DeleteItem : function(type,id){
            var ids,index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
           
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
            
        },
        CalculatePercentage : function(){
            data.allItems.exp.forEach(function(cur){
                cur.calPercentage(data.total.inc);
            });
        },
        GetPer:function(){
            var Allper = data.allItems.exp.map(function(cur){
                return cur.getPer();  
            });
            return Allper;
        },
        testing : function(){
            console.log(data);
        }
    }
                      
})();

//Controller
var Controller = (function(UIcntrl,DataCntrl){
    
    //Initialization 
    var SetupInit = function(){
        var DOMString = UIcntrl.GetDOM();
        //Event Listener 
        document.querySelector(DOMString.domBtn).addEventListener('click',cntrlAdd);
        document.addEventListener('keypress',function(event){
            if(event.keyCode === 13 || event.which === 13){
            cntrlAdd();
            }
        });
        document.querySelector(DOMString.domContainer).addEventListener('click',cntrlDelete);
        document.querySelector(DOMString.domType).addEventListener('change',UIcntrl.changeType);
    };
    
    var UpdateUI = function(){
        //1.calculate total of both
        DataCntrl.CalculateData();
        //2.return budget
        var BudgetGet = DataCntrl.getBudget();
        //3.Update in UI
        UIcntrl.UpdateBudgetUI(BudgetGet);
    }
    
    //Add New Items
    var cntrlAdd = function(){
        var getValue,getDataCntrl;
        getValue = UIcntrl.Getvalue();
        if(getValue.des !=="" && !isNaN(getValue.value) && getValue.value>0){
            
            //Data controller add data 
            getDataCntrl = DataCntrl.addNewItem(getValue.type,getValue.des,getValue.value);
            
            //UI control add UI
            UIcntrl.UIupdate(getDataCntrl,getValue.type);
            
            //Clear the field 
            UIcntrl.clearField();
            
            //get Budget
            UpdateUI();
            
            //Calculate Percentage
            DataCntrl.CalculatePercentage();
            
            //get Percentage
            var per = DataCntrl.GetPer();
            
            //display in Ui
            UIcntrl.displayPercentage(per);
           }
    }
    
    //Delte Items
    var cntrlDelete = function(event){
        var ItemID,splitItem,ID,type;
        ItemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(ItemID);
        if(ItemID){
            splitItem = ItemID.split('-');
            type = splitItem[0];
            ID = parseFloat(splitItem[1]);
            
            //Delete from data
            DataCntrl.DeleteItem(type,ID);
            
            //delete in Container UI
            UIcntrl.DeleteFrmUI(ItemID);
            
            //Update Budget
            UpdateUI();
        }
    }
    
    return{
        init : function(){
            console.log('Initialization Completed');
            UIcntrl.GetDate();
            UIcntrl.UpdateBudgetUI({
                totalInc : 0,
                totalExp : 0,
                Budget : 0,
                Per : -1
            });
            SetupInit();
        }
    } 
    
})(UIcontroller,DataController);

Controller.init();//start the Event listener 