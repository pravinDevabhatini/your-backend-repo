const { IST, calcProfit, carAgeDays } = require('../utils/helpers');
const { SERIES } = require('../config/constants');
const { getCarsData }         = require('./carController');
const { getUsersData }        = require('./userController');
const { getDepositsData, getTransactionsData } = require('./depositController');
const { getProfitRecords }    = require('./profitController');

const wallet = (uid, cars, txns) => {
  const dep = txns.filter(t=>t.userId===uid).reduce((s,t)=>s+(t.type==='credit'?t.amount:-t.amount),0);
  let invested=0, investedActive=0, earned=0, comm=0, pending=0;
  const myCars=[];
  cars.forEach(car=>{
    const inv=(car.investors||[]).find(i=>i.userId===uid);
    if(inv){
      invested+=inv.amount;
      myCars.push(car);
      if(car.status==='sold'){
        const tot=(car.investors||[]).reduce((s,i)=>s+i.amount,0);
        const r=inv.amount/tot;
        const{dist,margin}=calcProfit(car.soldPrice,car.totalCost,car.commissionPct);
        earned+=r*dist; comm+=r*margin;
      } else {
        investedActive+=inv.amount;
      }
    }
  });
  const profits=getProfitRecords().filter(p=>p.userId===uid);
  pending=profits.filter(p=>p.status==='pending').reduce((s,p)=>s+p.profitAmt,0);
  return{dep,invested,investedActive,balance:dep-investedActive,earned,comm,pending,myCars};
};

exports.getOverview = (req,res)=>{
  const cars=getCarsData(), users=getUsersData(), txns=getTransactionsData();
  const sold=cars.filter(c=>c.status==='sold'), avail=cars.filter(c=>c.status==='available');
  const totInv=cars.reduce((s,c)=>s+(c.investors||[]).reduce((a,i)=>a+i.amount,0),0);
  const sumP=sold.reduce((s,c)=>s+calcProfit(c.soldPrice,c.totalCost,c.commissionPct).gross,0);
  const sumM=sold.reduce((s,c)=>s+calcProfit(c.soldPrice,c.totalCost,c.commissionPct).margin,0);
  const sumD=sold.reduce((s,c)=>s+calcProfit(c.soldPrice,c.totalCost,c.commissionPct).dist,0);
  res.json({ success:true, summary:{ totalInvested:totInv,grossProfit:sumP,commission:sumM,distributed:sumD, totalCars:cars.length,soldCars:sold.length,availCars:avail.length,activeUsers:users.filter(u=>u.status==='active').length }, generatedAt:IST() });
};

exports.getGroupReport = (req,res)=>{
  const cars=getCarsData(), users=getUsersData();
  const sold=cars.filter(c=>c.status==='sold'), avail=cars.filter(c=>c.status==='available');
  const allGroups=Object.values(SERIES).flatMap(s=>s.groups);
  const soldGroups=allGroups.filter(g=>sold.some(c=>c.group===g)).map(g=>{
    const gS=sold.filter(c=>c.group===g);
    const ser=Object.entries(SERIES).find(([,s])=>s.groups.includes(g));
    return{ group:g, series:ser?ser[1].label:'?', members:users.filter(u=>u.group===g).length, carsSold:gS.length, invested:gS.reduce((s,c)=>s+(c.investors||[]).reduce((a,i)=>a+i.amount,0),0), cost:gS.reduce((s,c)=>s+c.totalCost,0), revenue:gS.reduce((s,c)=>s+(c.soldPrice||0),0), profit:gS.reduce((s,c)=>s+calcProfit(c.soldPrice,c.totalCost,c.commissionPct).gross,0), margin:gS.reduce((s,c)=>s+calcProfit(c.soldPrice,c.totalCost,c.commissionPct).margin,0), distributed:gS.reduce((s,c)=>s+calcProfit(c.soldPrice,c.totalCost,c.commissionPct).dist,0) };
  });
  const availGroups=allGroups.filter(g=>avail.some(c=>c.group===g)).map(g=>{
    const gA=avail.filter(c=>c.group===g);
    const ser=Object.entries(SERIES).find(([,s])=>s.groups.includes(g));
    return{ group:g, series:ser?ser[1].label:'?', members:users.filter(u=>u.group===g).length, carsAvail:gA.length, invested:gA.reduce((s,c)=>s+(c.investors||[]).reduce((a,i)=>a+i.amount,0),0), cost:gA.reduce((s,c)=>s+c.totalCost,0) };
  });
  res.json({ success:true, soldGroups, availGroups, generatedAt:IST() });
};

exports.getUserReport = (req,res)=>{
  const cars=getCarsData(), users=getUsersData(), txns=getTransactionsData();
  const report=users.map(u=>{ const w=wallet(u.id,cars,txns); return{ id:u.id,name:u.name,refId:u.refId,group:u.group,status:u.status,deposited:w.dep,invested:w.invested,investedActive:w.investedActive,profit:w.earned,commission:w.comm,profitPending:w.pending,balance:w.balance }; });
  res.json({ success:true, users:report, generatedAt:IST() });
};

exports.getCarReport = (req,res)=>{
  const cars=getCarsData();
  const sold=cars.filter(c=>c.status==='sold').map(car=>{
    const{gross,margin,dist}=calcProfit(car.soldPrice,car.totalCost,car.commissionPct);
    return{ id:car.id,name:`${car.make} ${car.model}`,year:car.year,group:car.group,fuel:car.fuelType,members:(car.investors||[]).length,buyPrice:car.purchasePrice,service:car.serviceCharges,totalCost:car.totalCost,soldPrice:car.soldPrice,commissionPct:car.commissionPct,gross,margin,dist,soldDate:car.soldDate,ageDays:carAgeDays(car.uploadedAt,car.soldDate),ageLabel:`Sold in ${carAgeDays(car.uploadedAt,car.soldDate)} days` };
  });
  const avail=cars.filter(c=>c.status==='available').map(car=>{
    const inv=(car.investors||[]).reduce((s,i)=>s+i.amount,0);
    return{ id:car.id,name:`${car.make} ${car.model}`,year:car.year,group:car.group,fuel:car.fuelType,members:(car.investors||[]).length,buyPrice:car.purchasePrice,service:car.serviceCharges,totalCost:car.totalCost,invested:inv,ageDays:carAgeDays(car.uploadedAt,null),ageLabel:`${carAgeDays(car.uploadedAt,null)} days in inventory` };
  });
  res.json({ success:true, sold, avail, generatedAt:IST() });
};

exports.getMonthReport = (req,res)=>{
  const cars=getCarsData(), users=getUsersData(), txns=getTransactionsData();
  const sold=cars.filter(c=>c.status==='sold');
  const months={};
  sold.forEach(car=>{
    const mo=(car.soldDate||'Unknown').split(' ').slice(0,3).join(' ');
    if(!months[mo]) months[mo]={n:0,rev:0,buy:0,svc:0,total:0,gp:0,dist:0,margin:0,cars:[],partnerIds:new Set(),groups:new Set()};
    const{gross,dist,margin}=calcProfit(car.soldPrice,car.totalCost,car.commissionPct);
    months[mo].n++; months[mo].rev+=car.soldPrice; months[mo].buy+=car.purchasePrice; months[mo].svc+=car.serviceCharges;
    months[mo].total+=car.totalCost; months[mo].gp+=gross; months[mo].dist+=dist; months[mo].margin+=margin;
    months[mo].cars.push(car);
    (car.investors||[]).forEach(i=>months[mo].partnerIds.add(i.userId));
    months[mo].groups.add(car.group);
  });
  const result=Object.entries(months).map(([month,d])=>({
    month, carsSold:d.n, totalBuy:d.buy, totalService:d.svc, totalCost:d.total, totalSold:d.rev, grossProfit:d.gp, commission:d.margin, distributed:d.dist,
    cars:d.cars.map(car=>{ const{gross,dist,margin}=calcProfit(car.soldPrice,car.totalCost,car.commissionPct); return{id:car.id,name:`${car.make} ${car.model}`,group:car.group,buy:car.purchasePrice,service:car.serviceCharges,total:car.totalCost,sold:car.soldPrice,commissionPct:car.commissionPct,gross,margin,dist,ageDays:carAgeDays(car.uploadedAt,car.soldDate)}; }),
    partners:[...d.partnerIds].map(uid=>{ const u=users.find(x=>x.id===uid); const w=wallet(uid,d.cars,txns); return{id:uid,name:u?.name,group:u?.group,invested:w.invested,profit:w.earned,comm:w.comm}; }),
    groups:[...d.groups],
  }));
  res.json({ success:true, months:result, generatedAt:IST() });
};
