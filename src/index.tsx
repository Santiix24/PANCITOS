import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Plus, ShoppingCart, BookOpen,
  Edit2, Trash2, Eye, EyeOff,
  Download, Zap, TrendingUp, Sun, Moon,
} from 'lucide-react';
import html2canvas from 'html2canvas';

// ============================================================================
// TIPOS
// ============================================================================

interface User {
  username: string;
  role: 'superadmin' | 'admin' | 'baker';
}

// Matriz de permisos centralizada
const PERMS = {
  canEditRecipes:    (r: User['role']) => ['superadmin','admin','baker'].includes(r),
  canUseCalculator:  (r: User['role']) => ['superadmin','admin','baker'].includes(r),
  canViewInventory:  (r: User['role']) => ['superadmin','admin','baker'].includes(r),
  canEditInventory:  (r: User['role']) => ['superadmin','admin'].includes(r),
  canViewCosts:      (r: User['role']) => ['superadmin','admin'].includes(r),
};

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: 'g' | 'kg' | 'ml' | 'L' | 'oz' | 'lb' | 'unid';
}

interface Recipe {
  id: string;
  name: string;
  category: 'Panadería' | 'Pastelería';
  ingredients: Ingredient[];
  temperature: number;
  time: number;
  instructions: string;
  createdBy: string;
  createdAt: string;
}

interface Operation {
  id: string;
  name: string;
  type: 'kg' | 'L' | 'unid';
  presentationWeight: number;
  unitsPurchased: number;
  totalCost: number;
  stockQuantity: number; // Stock disponible en gramos/ml/unidades
}

interface State {
  user: User | null;
  recipes: Recipe[];
  operations: Operation[];
  rememberMe: boolean;
  
  setUser: (user: User | null) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  addOperation: (op: Operation) => void;
  updateOperation: (id: string, op: Operation) => void;
  deleteOperation: (id: string) => void;
  setRememberMe: (value: boolean) => void;
}

// ============================================================================
// ZUSTAND STORE SIMPLIFICADO
// ============================================================================

const useStore = (() => {
  let state: State;
  const listeners = new Set<() => void>();

  const defaultRecipes: Recipe[] = [
    {
      id: '1',
      name: 'Pan Francés Tradicional',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina de trigo', quantity: 500, unit: 'g' },
        { id: '2', name: 'Agua', quantity: 300, unit: 'ml' },
        { id: '3', name: 'Sal', quantity: 10, unit: 'g' },
        { id: '4', name: 'Levadura fresca', quantity: 10, unit: 'g' },
      ],
      temperature: 220,
      time: 45,
      instructions: 'Mezclar ingredientes, fermentar 2 horas, formar y hornear. Clásico de la panadería francesa.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Pan Integral Saludable',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina integral', quantity: 400, unit: 'g' },
        { id: '2', name: 'Harina de trigo', quantity: 100, unit: 'g' },
        { id: '3', name: 'Agua tibia', quantity: 320, unit: 'ml' },
        { id: '4', name: 'Sal', quantity: 8, unit: 'g' },
        { id: '5', name: 'Levadura', quantity: 7, unit: 'g' },
        { id: '6', name: 'Miel', quantity: 20, unit: 'ml' },
      ],
      temperature: 200,
      time: 50,
      instructions: 'Mezclar harinas y agua, dejar reposar 30 min, agregar levadura, fermentar lentamente y hornear.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Croissant Francés Premium',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 500, unit: 'g' },
        { id: '2', name: 'Mantequilla', quantity: 250, unit: 'g' },
        { id: '3', name: 'Leche', quantity: 250, unit: 'ml' },
        { id: '4', name: 'Azúcar', quantity: 50, unit: 'g' },
        { id: '5', name: 'Sal', quantity: 10, unit: 'g' },
        { id: '6', name: 'Levadura', quantity: 10, unit: 'g' },
      ],
      temperature: 200,
      time: 30,
      instructions: 'Preparar masa madre, laminación con mantequilla, doblados, corte en triángulos, fermentar y hornear.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'Torta de Chocolate Jugosa',
      category: 'Pastelería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 300, unit: 'g' },
        { id: '2', name: 'Cacao en polvo', quantity: 60, unit: 'g' },
        { id: '3', name: 'Azúcar', quantity: 350, unit: 'g' },
        { id: '4', name: 'Huevos', quantity: 4, unit: 'unid' },
        { id: '5', name: 'Mantequilla', quantity: 150, unit: 'g' },
        { id: '6', name: 'Leche', quantity: 200, unit: 'ml' },
        { id: '7', name: 'Polvo de hornear', quantity: 12, unit: 'g' },
      ],
      temperature: 180,
      time: 35,
      instructions: 'Cremar mantequilla y azúcar, agregar huevos, mezclar secos, hornear hasta que pase el palillo.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Cheesecake New York',
      category: 'Pastelería',
      ingredients: [
        { id: '1', name: 'Galletas digestivas', quantity: 200, unit: 'g' },
        { id: '2', name: 'Mantequilla derretida', quantity: 100, unit: 'g' },
        { id: '3', name: 'Queso crema', quantity: 600, unit: 'g' },
        { id: '4', name: 'Azúcar', quantity: 150, unit: 'g' },
        { id: '5', name: 'Huevos', quantity: 3, unit: 'unid' },
        { id: '6', name: 'Crema ácida', quantity: 200, unit: 'ml' },
        { id: '7', name: 'Vainilla', quantity: 10, unit: 'ml' },
      ],
      temperature: 170,
      time: 60,
      instructions: 'Base de galletas, mezclar queso crema con azúcar, agregar huevos lentamente, hornear a baño maría.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '6',
      name: 'Pan de Canela y Azúcar',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 400, unit: 'g' },
        { id: '2', name: 'Leche tibia', quantity: 200, unit: 'ml' },
        { id: '3', name: 'Huevos', quantity: 2, unit: 'unid' },
        { id: '4', name: 'Mantequilla', quantity: 80, unit: 'g' },
        { id: '5', name: 'Azúcar', quantity: 100, unit: 'g' },
        { id: '6', name: 'Canela molida', quantity: 15, unit: 'g' },
        { id: '7', name: 'Levadura', quantity: 10, unit: 'g' },
      ],
      temperature: 190,
      time: 40,
      instructions: 'Masa dulce, enrollar con mezcla de canela y azúcar, fermentar, hornear hasta dorados.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '7',
      name: 'Donas Glaseadas Clásicas',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 300, unit: 'g' },
        { id: '2', name: 'Azúcar', quantity: 80, unit: 'g' },
        { id: '3', name: 'Huevos', quantity: 2, unit: 'unid' },
        { id: '4', name: 'Leche', quantity: 150, unit: 'ml' },
        { id: '5', name: 'Levadura en polvo', quantity: 10, unit: 'g' },
        { id: '6', name: 'Aceite', quantity: 60, unit: 'ml' },
        { id: '7', name: 'Vainilla', quantity: 5, unit: 'ml' },
      ],
      temperature: 180,
      time: 25,
      instructions: 'Mezclar ingredientes secos, agregar húmedos, freír en aceite caliente, glasear.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '8',
      name: 'Brownies de Chocolate Negro',
      category: 'Pastelería',
      ingredients: [
        { id: '1', name: 'Chocolate negro', quantity: 200, unit: 'g' },
        { id: '2', name: 'Mantequilla', quantity: 150, unit: 'g' },
        { id: '3', name: 'Azúcar', quantity: 200, unit: 'g' },
        { id: '4', name: 'Huevos', quantity: 3, unit: 'unid' },
        { id: '5', name: 'Harina', quantity: 100, unit: 'g' },
        { id: '6', name: 'Polvo de hornear', quantity: 5, unit: 'g' },
        { id: '7', name: 'Nueces', quantity: 100, unit: 'g' },
      ],
      temperature: 175,
      time: 30,
      instructions: 'Derretir chocolate y mantequilla, mezclar con azúcar y huevos, agregar harina, hornear.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '9',
      name: 'Tarta de Fresas y Crema',
      category: 'Pastelería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 250, unit: 'g' },
        { id: '2', name: 'Azúcar', quantity: 100, unit: 'g' },
        { id: '3', name: 'Huevos', quantity: 3, unit: 'unid' },
        { id: '4', name: 'Mantequilla', quantity: 100, unit: 'g' },
        { id: '5', name: 'Crema para batir', quantity: 300, unit: 'ml' },
        { id: '6', name: 'Fresas frescas', quantity: 400, unit: 'g' },
        { id: '7', name: 'Mermelada de fresa', quantity: 100, unit: 'ml' },
      ],
      temperature: 190,
      time: 35,
      instructions: 'Bizcocho base, crema batida con azúcar, colocar fresas, decorar con mermelada.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '10',
      name: 'Pan de Ajo Casero',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Pan francés', quantity: 600, unit: 'g' },
        { id: '2', name: 'Mantequilla', quantity: 150, unit: 'g' },
        { id: '3', name: 'Ajo molido', quantity: 30, unit: 'g' },
        { id: '4', name: 'Perejil fresco', quantity: 20, unit: 'g' },
        { id: '5', name: 'Sal', quantity: 5, unit: 'g' },
        { id: '6', name: 'Pimienta negra', quantity: 3, unit: 'g' },
      ],
      temperature: 200,
      time: 15,
      instructions: 'Mezclar mantequilla con ajo y perejil, untar pan cortado, envolver y hornear.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '11',
      name: 'Empanadas Rellenas de Carne',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 500, unit: 'g' },
        { id: '2', name: 'Mantequilla', quantity: 100, unit: 'g' },
        { id: '3', name: 'Agua', quantity: 200, unit: 'ml' },
        { id: '4', name: 'Carne molida', quantity: 400, unit: 'g' },
        { id: '5', name: 'Cebolla', quantity: 150, unit: 'g' },
        { id: '6', name: 'Ajo', quantity: 20, unit: 'g' },
        { id: '7', name: 'Huevo', quantity: 1, unit: 'unid' },
      ],
      temperature: 200,
      time: 25,
      instructions: 'Preparar masa, relleno de carne salteada, cerrar bien, pintar con huevo y hornear hasta dorado.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '12',
      name: 'Tres Leches Premium',
      category: 'Pastelería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 250, unit: 'g' },
        { id: '2', name: 'Huevos', quantity: 4, unit: 'unid' },
        { id: '3', name: 'Azúcar', quantity: 200, unit: 'g' },
        { id: '4', name: 'Leche condensada', quantity: 400, unit: 'ml' },
        { id: '5', name: 'Leche evaporada', quantity: 400, unit: 'ml' },
        { id: '6', name: 'Crema de leche', quantity: 200, unit: 'ml' },
        { id: '7', name: 'Vainilla', quantity: 10, unit: 'ml' },
      ],
      temperature: 180,
      time: 30,
      instructions: 'Bizcocho esponjoso, mezclar tres leches, verter sobre el bizcocho, refrigerar 4 horas.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '13',
      name: 'Moka de Café',
      category: 'Pastelería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 300, unit: 'g' },
        { id: '2', name: 'Cacao en polvo', quantity: 50, unit: 'g' },
        { id: '3', name: 'Café molido', quantity: 30, unit: 'g' },
        { id: '4', name: 'Azúcar', quantity: 250, unit: 'g' },
        { id: '5', name: 'Huevos', quantity: 4, unit: 'unid' },
        { id: '6', name: 'Mantequilla', quantity: 150, unit: 'g' },
        { id: '7', name: 'Crema para batir', quantity: 400, unit: 'ml' },
      ],
      temperature: 175,
      time: 35,
      instructions: 'Bizcochos de café y chocolate, relleno y cobertura de crema de café, decorar con polvo de café.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '14',
      name: 'Pan de Molde Blanco',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina de fuerza', quantity: 600, unit: 'g' },
        { id: '2', name: 'Agua', quantity: 350, unit: 'ml' },
        { id: '3', name: 'Sal', quantity: 12, unit: 'g' },
        { id: '4', name: 'Levadura fresca', quantity: 12, unit: 'g' },
        { id: '5', name: 'Azúcar', quantity: 20, unit: 'g' },
        { id: '6', name: 'Mantequilla', quantity: 50, unit: 'g' },
      ],
      temperature: 210,
      time: 50,
      instructions: 'Amasar, primera fermentación 2 horas, moldear, segunda fermentación 1 hora, hornear.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '15',
      name: 'Tartaleta de Manzana',
      category: 'Pastelería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 250, unit: 'g' },
        { id: '2', name: 'Mantequilla', quantity: 120, unit: 'g' },
        { id: '3', name: 'Azúcar', quantity: 80, unit: 'g' },
        { id: '4', name: 'Huevo', quantity: 1, unit: 'unid' },
        { id: '5', name: 'Manzanas verdes', quantity: 500, unit: 'g' },
        { id: '6', name: 'Canela', quantity: 10, unit: 'g' },
        { id: '7', name: 'Mermelada de albaricoque', quantity: 100, unit: 'ml' },
      ],
      temperature: 190,
      time: 40,
      instructions: 'Masa quebrada, relleno de manzanas con canela, cubrir con mermelada, hornear hasta dorado.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '16',
      name: 'Baguette Francesa',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina de fuerza', quantity: 500, unit: 'g' },
        { id: '2', name: 'Agua', quantity: 310, unit: 'ml' },
        { id: '3', name: 'Sal', quantity: 10, unit: 'g' },
        { id: '4', name: 'Levadura fresca', quantity: 8, unit: 'g' },
      ],
      temperature: 240,
      time: 40,
      instructions: 'Masa hueca, fermentación larga, cortes característicos, hornear a vapor inicial.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '17',
      name: 'Strudel de Manzana',
      category: 'Pastelería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 300, unit: 'g' },
        { id: '2', name: 'Huevos', quantity: 3, unit: 'unid' },
        { id: '3', name: 'Mantequilla', quantity: 100, unit: 'g' },
        { id: '4', name: 'Azúcar', quantity: 100, unit: 'g' },
        { id: '5', name: 'Manzanas', quantity: 600, unit: 'g' },
        { id: '6', name: 'Pasas', quantity: 80, unit: 'g' },
        { id: '7', name: 'Canela', quantity: 15, unit: 'g' },
      ],
      temperature: 180,
      time: 50,
      instructions: 'Masa estirada finamente, relleno de manzanas condimentadas, enrollar, hornear lentamente.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '18',
      name: 'Magdalenas Caseras',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 200, unit: 'g' },
        { id: '2', name: 'Azúcar', quantity: 200, unit: 'g' },
        { id: '3', name: 'Mantequilla', quantity: 150, unit: 'g' },
        { id: '4', name: 'Huevos', quantity: 3, unit: 'unid' },
        { id: '5', name: 'Leche', quantity: 100, unit: 'ml' },
        { id: '6', name: 'Vainilla', quantity: 10, unit: 'ml' },
        { id: '7', name: 'Polvo de hornear', quantity: 12, unit: 'g' },
      ],
      temperature: 200,
      time: 20,
      instructions: 'Cremar mantequilla y azúcar, agregar huevos, mezclar con harinas y leche, hornear en moldes.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '19',
      name: 'Ensaimada Mallorquina',
      category: 'Panadería',
      ingredients: [
        { id: '1', name: 'Harina', quantity: 500, unit: 'g' },
        { id: '2', name: 'Mantequilla', quantity: 200, unit: 'g' },
        { id: '3', name: 'Leche', quantity: 200, unit: 'ml' },
        { id: '4', name: 'Azúcar', quantity: 100, unit: 'g' },
        { id: '5', name: 'Huevos', quantity: 2, unit: 'unid' },
        { id: '6', name: 'Levadura', quantity: 10, unit: 'g' },
        { id: '7', name: 'Sal', quantity: 8, unit: 'g' },
      ],
      temperature: 190,
      time: 45,
      instructions: 'Masa dulce, laminación con mantequilla, enrollada en espiral, fermentación y horneado.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
    {
      id: '20',
      name: 'Tiramisú Italiano',
      category: 'Pastelería',
      ingredients: [
        { id: '1', name: 'Yemas de huevo', quantity: 6, unit: 'unid' },
        { id: '2', name: 'Azúcar', quantity: 150, unit: 'g' },
        { id: '3', name: 'Mascarpone', quantity: 600, unit: 'g' },
        { id: '4', name: 'Café espresso', quantity: 400, unit: 'ml' },
        { id: '5', name: 'Ron o Marsala', quantity: 50, unit: 'ml' },
        { id: '6', name: 'Galletas de soletilla', quantity: 300, unit: 'g' },
        { id: '7', name: 'Cacao en polvo', quantity: 30, unit: 'g' },
      ],
      temperature: 0,
      time: 480,
      instructions: 'Crema de mascarpone sobre café, capas de galletas, espolvorear cacao, refrigerar 8 horas.',
      createdBy: 'Administrador',
      createdAt: new Date().toISOString(),
    },
  ];

  const defaultOperations: Operation[] = [
    // Harinas (precios Colombia - bulto 50kg promedio $120.000-$150.000)
    { id: '1', name: 'Harina de trigo', type: 'kg', presentationWeight: 50, unitsPurchased: 2, totalCost: 260000, stockQuantity: 100000 },
    { id: '2', name: 'Harina integral', type: 'kg', presentationWeight: 25, unitsPurchased: 2, totalCost: 145000, stockQuantity: 50000 },
    { id: '3', name: 'Harina de fuerza', type: 'kg', presentationWeight: 25, unitsPurchased: 2, totalCost: 180000, stockQuantity: 50000 },
    // Agua (muy económica)
    { id: '4', name: 'Agua', type: 'L', presentationWeight: 20, unitsPurchased: 5, totalCost: 8000, stockQuantity: 100000 },
    { id: '5', name: 'Agua tibia', type: 'L', presentationWeight: 20, unitsPurchased: 5, totalCost: 8000, stockQuantity: 100000 },
    // Sal (bulto 25kg ~$25.000)
    { id: '6', name: 'Sal', type: 'kg', presentationWeight: 25, unitsPurchased: 1, totalCost: 25000, stockQuantity: 25000 },
    // Levaduras
    { id: '7', name: 'Levadura fresca', type: 'kg', presentationWeight: 0.5, unitsPurchased: 10, totalCost: 85000, stockQuantity: 5000 },
    { id: '8', name: 'Levadura', type: 'kg', presentationWeight: 0.5, unitsPurchased: 10, totalCost: 85000, stockQuantity: 5000 },
    { id: '9', name: 'Levadura en polvo', type: 'kg', presentationWeight: 0.5, unitsPurchased: 4, totalCost: 48000, stockQuantity: 2000 },
    // Lácteos (precios Colombia)
    { id: '10', name: 'Mantequilla', type: 'kg', presentationWeight: 1, unitsPurchased: 10, totalCost: 380000, stockQuantity: 10000 },
    { id: '11', name: 'Mantequilla derretida', type: 'kg', presentationWeight: 1, unitsPurchased: 5, totalCost: 190000, stockQuantity: 5000 },
    { id: '12', name: 'Leche', type: 'L', presentationWeight: 1, unitsPurchased: 50, totalCost: 175000, stockQuantity: 50000 },
    { id: '13', name: 'Leche tibia', type: 'L', presentationWeight: 1, unitsPurchased: 20, totalCost: 70000, stockQuantity: 20000 },
    { id: '14', name: 'Crema de leche', type: 'L', presentationWeight: 1, unitsPurchased: 10, totalCost: 85000, stockQuantity: 10000 },
    { id: '15', name: 'Crema para batir', type: 'L', presentationWeight: 1, unitsPurchased: 8, totalCost: 96000, stockQuantity: 8000 },
    { id: '16', name: 'Crema ácida', type: 'L', presentationWeight: 1, unitsPurchased: 5, totalCost: 55000, stockQuantity: 5000 },
    { id: '17', name: 'Queso crema', type: 'kg', presentationWeight: 1, unitsPurchased: 4, totalCost: 120000, stockQuantity: 4000 },
    { id: '18', name: 'Mascarpone', type: 'kg', presentationWeight: 0.5, unitsPurchased: 4, totalCost: 96000, stockQuantity: 2000 },
    { id: '19', name: 'Leche condensada', type: 'L', presentationWeight: 0.4, unitsPurchased: 20, totalCost: 180000, stockQuantity: 8000 },
    { id: '20', name: 'Leche evaporada', type: 'L', presentationWeight: 0.4, unitsPurchased: 15, totalCost: 105000, stockQuantity: 6000 },
    // Endulzantes
    { id: '21', name: 'Azúcar', type: 'kg', presentationWeight: 50, unitsPurchased: 1, totalCost: 145000, stockQuantity: 50000 },
    { id: '22', name: 'Miel', type: 'L', presentationWeight: 0.5, unitsPurchased: 4, totalCost: 72000, stockQuantity: 2000 },
    // Huevos (cubeta 30 huevos ~$18.000-$22.000)
    { id: '23', name: 'Huevos', type: 'unid', presentationWeight: 1, unitsPurchased: 300, totalCost: 180000, stockQuantity: 300 },
    { id: '24', name: 'Huevo', type: 'unid', presentationWeight: 1, unitsPurchased: 120, totalCost: 72000, stockQuantity: 120 },
    { id: '25', name: 'Yemas de huevo', type: 'unid', presentationWeight: 1, unitsPurchased: 60, totalCost: 48000, stockQuantity: 60 },
    // Chocolate y cacao
    { id: '26', name: 'Cacao en polvo', type: 'kg', presentationWeight: 1, unitsPurchased: 3, totalCost: 135000, stockQuantity: 3000 },
    { id: '27', name: 'Chocolate negro', type: 'kg', presentationWeight: 1, unitsPurchased: 5, totalCost: 225000, stockQuantity: 5000 },
    // Especias y saborizantes
    { id: '28', name: 'Vainilla', type: 'L', presentationWeight: 0.5, unitsPurchased: 2, totalCost: 48000, stockQuantity: 1000 },
    { id: '29', name: 'Canela molida', type: 'kg', presentationWeight: 0.25, unitsPurchased: 4, totalCost: 56000, stockQuantity: 1000 },
    { id: '30', name: 'Canela', type: 'kg', presentationWeight: 0.25, unitsPurchased: 4, totalCost: 56000, stockQuantity: 1000 },
    // Frutas y frutos secos
    { id: '31', name: 'Fresas frescas', type: 'kg', presentationWeight: 1, unitsPurchased: 8, totalCost: 80000, stockQuantity: 8000 },
    { id: '32', name: 'Manzanas verdes', type: 'kg', presentationWeight: 1, unitsPurchased: 10, totalCost: 45000, stockQuantity: 10000 },
    { id: '33', name: 'Manzanas', type: 'kg', presentationWeight: 1, unitsPurchased: 10, totalCost: 45000, stockQuantity: 10000 },
    { id: '34', name: 'Nueces', type: 'kg', presentationWeight: 1, unitsPurchased: 2, totalCost: 110000, stockQuantity: 2000 },
    { id: '35', name: 'Pasas', type: 'kg', presentationWeight: 0.5, unitsPurchased: 4, totalCost: 48000, stockQuantity: 2000 },
    // Mermeladas y conservas
    { id: '36', name: 'Mermelada de fresa', type: 'L', presentationWeight: 1, unitsPurchased: 4, totalCost: 64000, stockQuantity: 4000 },
    { id: '37', name: 'Mermelada de albaricoque', type: 'L', presentationWeight: 0.5, unitsPurchased: 4, totalCost: 48000, stockQuantity: 2000 },
    // Galletas y bases
    { id: '38', name: 'Galletas digestivas', type: 'kg', presentationWeight: 0.5, unitsPurchased: 8, totalCost: 72000, stockQuantity: 4000 },
    { id: '39', name: 'Galletas de soletilla', type: 'kg', presentationWeight: 0.4, unitsPurchased: 6, totalCost: 54000, stockQuantity: 2400 },
    { id: '40', name: 'Pan francés', type: 'kg', presentationWeight: 1, unitsPurchased: 10, totalCost: 45000, stockQuantity: 10000 },
    // Aceites y grasas
    { id: '41', name: 'Aceite', type: 'L', presentationWeight: 3, unitsPurchased: 4, totalCost: 84000, stockQuantity: 12000 },
    // Polvo de hornear y otros
    { id: '42', name: 'Polvo de hornear', type: 'kg', presentationWeight: 0.5, unitsPurchased: 4, totalCost: 32000, stockQuantity: 2000 },
    // Café y bebidas
    { id: '43', name: 'Café molido', type: 'kg', presentationWeight: 0.5, unitsPurchased: 4, totalCost: 68000, stockQuantity: 2000 },
    { id: '44', name: 'Café espresso', type: 'L', presentationWeight: 1, unitsPurchased: 5, totalCost: 85000, stockQuantity: 5000 },
    { id: '45', name: 'Ron o Marsala', type: 'L', presentationWeight: 0.75, unitsPurchased: 2, totalCost: 90000, stockQuantity: 1500 },
    // Carnes y proteínas
    { id: '46', name: 'Carne molida', type: 'kg', presentationWeight: 1, unitsPurchased: 10, totalCost: 190000, stockQuantity: 10000 },
    // Vegetales y hierbas
    { id: '47', name: 'Cebolla', type: 'kg', presentationWeight: 1, unitsPurchased: 10, totalCost: 35000, stockQuantity: 10000 },
    { id: '48', name: 'Ajo', type: 'kg', presentationWeight: 0.5, unitsPurchased: 4, totalCost: 28000, stockQuantity: 2000 },
    { id: '49', name: 'Ajo molido', type: 'kg', presentationWeight: 0.25, unitsPurchased: 4, totalCost: 24000, stockQuantity: 1000 },
    { id: '50', name: 'Perejil fresco', type: 'kg', presentationWeight: 0.1, unitsPurchased: 10, totalCost: 20000, stockQuantity: 1000 },
    { id: '51', name: 'Pimienta negra', type: 'kg', presentationWeight: 0.1, unitsPurchased: 5, totalCost: 25000, stockQuantity: 500 },
  ];

  const loadFromStorage = (): State => {
    try {
      const saved = localStorage.getItem('pancitos-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Combinar con recetas por defecto si no hay recetas guardadas
        if (!parsed.recipes || parsed.recipes.length === 0) {
          parsed.recipes = defaultRecipes;
        }
        // Combinar con operaciones por defecto si no hay operaciones guardadas
        if (!parsed.operations || parsed.operations.length === 0) {
          parsed.operations = defaultOperations;
        } else {
          // Migrar operaciones que no tengan stockQuantity
          parsed.operations = parsed.operations.map((op: Operation) => {
            if (op.stockQuantity === undefined || op.stockQuantity === null) {
              const calculatedStock = op.type === 'kg' || op.type === 'L'
                ? op.presentationWeight * op.unitsPurchased * 1000
                : op.presentationWeight * op.unitsPurchased;
              return { ...op, stockQuantity: calculatedStock };
            }
            return op;
          });
        }
        return parsed;
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }

    return {
      user: null,
      recipes: defaultRecipes,
      operations: defaultOperations,
      rememberMe: false,
      setUser: () => {},
      addRecipe: () => {},
      updateRecipe: () => {},
      deleteRecipe: () => {},
      addOperation: () => {},
      updateOperation: () => {},
      deleteOperation: () => {},
      setRememberMe: () => {},
    };
  };

  const saveToStorage = () => {
    try {
      const toSave = {
        user: state.user,
        recipes: state.recipes,
        operations: state.operations,
        rememberMe: state.rememberMe,
      };
      localStorage.setItem('pancitos-state', JSON.stringify(toSave));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  state = {
    ...loadFromStorage(),
    setUser: (user) => {
      state.user = user;
      saveToStorage();
      notifyListeners();
    },
    addRecipe: (recipe) => {
      state.recipes.push(recipe);
      saveToStorage();
      notifyListeners();
    },
    updateRecipe: (id, recipe) => {
      const index = state.recipes.findIndex((r) => r.id === id);
      if (index !== -1) {
        state.recipes[index] = recipe;
        saveToStorage();
        notifyListeners();
      }
    },
    deleteRecipe: (id) => {
      state.recipes = state.recipes.filter((r) => r.id !== id);
      saveToStorage();
      notifyListeners();
    },
    addOperation: (op) => {
      state.operations.push(op);
      saveToStorage();
      notifyListeners();
    },
    updateOperation: (id, op) => {
      const index = state.operations.findIndex((o) => o.id === id);
      if (index !== -1) {
        state.operations[index] = op;
        saveToStorage();
        notifyListeners();
      }
    },
    deleteOperation: (id) => {
      state.operations = state.operations.filter((o) => o.id !== id);
      saveToStorage();
      notifyListeners();
    },
    setRememberMe: (value) => {
      state.rememberMe = value;
      saveToStorage();
      notifyListeners();
    },
  };

  const notifyListeners = () => {
    listeners.forEach((listener) => listener());
  };

  return {
    getState: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        if (listeners.has(listener)) listeners.delete(listener);
      };
    },
  };
})();

function useAppState(): State {
  const [, setVersion] = useState(0);
  const stateRef = useRef<State | null>(null);

  useEffect(() => {
    if (!stateRef.current) {
      stateRef.current = useStore.getState();
    }

    const unsubscribe = useStore.subscribe(() => {
      stateRef.current = useStore.getState();
      setVersion((v) => v + 1);
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return stateRef.current || useStore.getState();
}

// ============================================================================
// HELPER: VERIFICAR DISPONIBILIDAD DE INGREDIENTES EN INVENTARIO
// ============================================================================

// Normaliza nombres para comparación (quita acentos, minúsculas, espacios extra)
const normalizeIngredientName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Verifica si un ingrediente está disponible en el inventario
const checkIngredientInInventory = (
  ingredientName: string,
  operations: Operation[]
): { available: boolean; inventoryItem: Operation | null } => {
  const normalizedIngredient = normalizeIngredientName(ingredientName);
  
  const found = operations.find((op) => {
    const normalizedOp = normalizeIngredientName(op.name);
    // Busca coincidencia exacta o parcial
    return normalizedOp === normalizedIngredient || 
           normalizedOp.includes(normalizedIngredient) || 
           normalizedIngredient.includes(normalizedOp);
  });

  return {
    available: !!found,
    inventoryItem: found || null,
  };
};

// ============================================================================
// CREDENCIALES
// ============================================================================

const CREDENTIALS = {
  // 👑 Dueño: acceso completo a todo, incluye costos y gestión
  'Administrador': { password: 'Administrador2026', role: 'superadmin', label: 'Dueño / Super Admin',    emoji: '👑' },
  // 👨‍🍳 Panadero jefe: CRUD recetas + calculadora + ver inventario (sin costos)
  'pancitos':      { password: 'pancitos2026',      role: 'baker',      label: 'Panadero Jefe Pancitos', emoji: '👨‍🍳' },
} as const;

const ROLE_INFO: Record<User['role'], { label: string; badge: string; emoji: string }> = {
  superadmin: { label: 'Dueño / Super Admin',    badge: 'bg-yellow-400/30 text-yellow-100', emoji: '👑' },
  admin:      { label: 'Administrador',           badge: 'bg-blue-400/30 text-blue-100',    emoji: '🔑' },
  baker:      { label: 'Panadero Jefe',           badge: 'bg-orange-400/30 text-orange-100',emoji: '👨‍🍳' },
};

// ============================================================================
// LOGIN PAGE - ULTRA BONITA Y DINÁMICA
// ============================================================================

// ============================================================================
// LOGIN FORM PANEL — definido FUERA del LoginPage para evitar pérdida de foco
// ============================================================================
const LoginFormPanel: React.FC<{
  username: string; setUsername: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  showPassword: boolean; setShowPassword: (v: boolean) => void;
  remember: boolean; setRemember: (v: boolean) => void;
  error: string; isLoading: boolean;
  quickLogin: (user: string) => void;
}> = ({ username, setUsername, password, setPassword, showPassword, setShowPassword, remember, setRemember, error, isLoading, quickLogin }) => (
  <div className="w-full space-y-5">
    {/* Username */}
    <div>
      <label className="block text-sm font-semibold text-vanilla mb-2 tracking-wide">👤 Usuario</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full px-5 py-4 rounded-3xl bg-white/20 border-2 border-peach/40 text-vanilla placeholder-vanilla/60 focus:outline-none focus:border-peach focus:bg-white/25 transition-all text-lg font-medium backdrop-blur-xl shadow-inner"
        placeholder="pancitos"
        autoComplete="username"
      />
    </div>
    {/* Password */}
    <div>
      <label className="block text-sm font-semibold text-vanilla mb-2 tracking-wide">🔐 Contraseña</label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-5 py-4 rounded-3xl bg-white/20 border-2 border-peach/40 text-vanilla placeholder-vanilla/60 focus:outline-none focus:border-peach focus:bg-white/25 transition-all text-lg font-medium backdrop-blur-xl shadow-inner"
          placeholder="••••••••"
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-vanilla/70 hover:text-vanilla transition-colors"
        >
          {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      </div>
    </div>
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="bg-blush/40 border-2 border-blush/60 text-primary px-5 py-3 rounded-2xl text-sm text-center font-semibold backdrop-blur-sm"
        >
          {error}
        </motion.div>
      )}
    </AnimatePresence>
    {/* Remember */}
    <label className="flex items-center gap-3 text-vanilla/90 text-sm cursor-pointer font-medium">
      <input
        type="checkbox"
        checked={remember}
        onChange={(e) => setRemember(e.target.checked)}
        className="w-5 h-5 rounded-lg accent-peach cursor-pointer"
      />
      Recordar credenciales
    </label>
    {/* Login Button */}
    <motion.button
      whileHover={{ scale: 1.03, boxShadow: '0 20px 50px rgba(212, 165, 116, 0.35)' }}
      whileTap={{ scale: 0.97 }}
      type="submit"
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-peach via-vanilla to-wheat hover:from-vanilla hover:to-peach text-primary font-bold py-4 rounded-3xl text-xl transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2 shadow-warm border border-white/30"
    >
      {isLoading ? (
        <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>🥐</motion.span> Ingresando...</>
      ) : '✨ Ingresar'}
    </motion.button>
    {/* Quick access */}
    <div>
      <p className="text-vanilla/50 text-center text-xs font-semibold tracking-widest mb-3">✦ Acceso Rápido</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { user: 'Administrador', label: 'Dueño',     icon: '👑', color: 'from-honey/40 to-caramel/30' },
          { user: 'pancitos',      label: 'Panadero',  icon: '👨‍🍳', color: 'from-peach/40 to-blush/30' },
        ].map((q) => (
          <motion.button
            key={q.user}
            type="button"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => quickLogin(q.user)}
            className={`bg-gradient-to-br ${q.color} backdrop-blur-xl border border-white/30 text-vanilla py-3 px-4 rounded-2xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-glass hover:shadow-warm`}
          >
            <span className="text-lg">{q.icon}</span>
            <span>{q.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  </div>
);

const LoginPage: React.FC<{
  onLogin: (user: User, remember: boolean) => void;
}> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pancitos-remember');
    if (saved) {
      const creds = JSON.parse(saved);
      setUsername(creds.username);
      setRemember(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate login delay for more dynamic feel
    setTimeout(() => {
      const cred = CREDENTIALS[username as keyof typeof CREDENTIALS];
      if (!cred || cred.password !== password) {
        setError('❌ Usuario o contraseña incorrectos');
        setIsLoading(false);
        return;
      }

      if (remember) {
        localStorage.setItem('pancitos-remember', JSON.stringify({ username }));
      } else {
        localStorage.removeItem('pancitos-remember');
      }

      onLogin({ username, role: cred.role as any }, remember);
    }, 300);
  };

  const quickLogin = (user: string) => {
    const cred = CREDENTIALS[user as keyof typeof CREDENTIALS];
    if (cred) {
      onLogin({ username: user, role: cred.role as any }, false);
    }
  };

  /* nada — FormPanel fue extraído fuera como LoginFormPanel */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-primary via-mocha to-caramel relative overflow-hidden"
    >
      {/* Decorative vintage background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ y: [0,-30,0], x:[0,20,0], rotate:[0, 5, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-peach/20 to-vanilla/10 rounded-full blur-3xl" />
        <motion.div animate={{ y: [0,40,0], x:[0,-25,0] }} transition={{ duration: 15, repeat: Infinity, delay:2, ease: 'easeInOut' }}
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-honey/15 to-caramel/10 rounded-full blur-3xl" />
        <motion.div animate={{ scale:[1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-blush/10 rounded-full blur-2xl" />
      </div>

      {/* ========== MOBILE: centrado vertical ========== */}
      <div className="lg:hidden min-h-screen flex flex-col items-center justify-center p-5 relative z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <motion.div animate={{ y:[0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-8xl inline-block mb-4 drop-shadow-2xl">🥐</motion.div>
            <h1 className="text-4xl font-bold font-playfair text-vanilla mb-2 tracking-wide">PANCITOS</h1>
            <p className="text-peach/80 text-sm font-medium tracking-[0.25em] uppercase">Panadería Artesanal</p>
            <span className="inline-block mt-3 px-4 py-1 rounded-full bg-honey/20 border border-honey/30 text-honey text-[10px] font-semibold tracking-widest uppercase">v1.0.0 · Premium</span>
          </div>
          <div className="glass-warm rounded-[32px] p-7 shadow-warm border border-white/20">
            <form onSubmit={handleLogin}>
              <LoginFormPanel
                username={username} setUsername={setUsername}
                password={password} setPassword={setPassword}
                showPassword={showPassword} setShowPassword={setShowPassword}
                remember={remember} setRemember={setRemember}
                error={error} isLoading={isLoading}
                quickLogin={quickLogin}
              />
            </form>
          </div>
          <p className="text-vanilla/30 text-xs text-center mt-6 font-medium">🔒 Datos seguros · Funciona offline</p>
        </motion.div>
      </div>

      {/* ========== DESKTOP: Split Screen ========== */}
      <div className="hidden lg:flex min-h-screen relative z-10">

        {/* IZQUIERDA — Branding 55% */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-[55%] flex flex-col items-center justify-center p-16 relative"
        >
          <div className="text-center max-w-md">
            <motion.div
              animate={{ y:[0, -15, 0], rotate:[0, 3, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[140px] leading-none mb-10 drop-shadow-2xl"
            >🥐</motion.div>

            <h1 className="text-7xl font-bold font-playfair text-vanilla mb-4 leading-tight tracking-wide">
              PANCITOS
            </h1>
            <p className="text-peach/70 text-xl font-medium tracking-[0.4em] mb-14 uppercase">Panadería Artesanal</p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-5 text-left">
              {[
                { icon: '📖', title: '20 Recetas', desc: 'Pan, pasteles y más' },
                { icon: '🧮', title: 'Calculadora', desc: 'Escala ingredientes' },
                { icon: '🛒', title: 'Inventario', desc: '30 insumos listos' },
                { icon: '💰', title: 'Costos', desc: 'Analiza márgenes' },
              ].map((f) => (
                <motion.div
                  key={f.title}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="glass-warm backdrop-blur-xl border border-white/15 rounded-3xl p-5 shadow-glass hover:shadow-warm transition-all duration-300"
                >
                  <div className="text-4xl mb-2">{f.icon}</div>
                  <p className="text-vanilla font-semibold text-sm">{f.title}</p>
                  <p className="text-peach/60 text-xs">{f.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 flex items-center justify-center gap-4">
              <div className="w-2 h-2 bg-peach/50 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
              <div className="w-2 h-2 bg-peach/50 rounded-full animate-bounce" style={{animationDelay:'200ms'}} />
              <div className="w-2 h-2 bg-peach/50 rounded-full animate-bounce" style={{animationDelay:'400ms'}} />
            </div>
          </div>
        </motion.div>

        {/* DERECHA — Formulario 45% */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="w-[45%] flex items-center justify-center p-12 bg-gradient-to-br from-cocoa/40 to-primary/60 backdrop-blur-sm border-l border-caramel/20"
        >
          <div className="w-full max-w-md">
            <div className="mb-10">
              <h2 className="text-4xl font-bold font-playfair text-vanilla mb-2">Bienvenido</h2>
              <p className="text-peach/60 text-sm font-medium">Ingresa tus credenciales para continuar</p>
            </div>
            <form onSubmit={handleLogin}>
              <LoginFormPanel
                username={username} setUsername={setUsername}
                password={password} setPassword={setPassword}
                showPassword={showPassword} setShowPassword={setShowPassword}
                remember={remember} setRemember={setRemember}
                error={error} isLoading={isLoading}
                quickLogin={quickLogin}
              />
            </form>
            <p className="text-vanilla/25 text-xs text-center mt-10">🔒 Datos seguros · Modo offline disponible</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// HOME DASHBOARD - ULTRA DINÁMICO Y HERMOSO
// ============================================================================

const HomePage: React.FC<{
  user: User;
  stats: { recipes: number; inventory: number };
  onNavigate: (view: string) => void;
}> = ({ user, stats, onNavigate }) => {

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-24">
      {/* Welcome Banner - Vintage Artisanal Style */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] p-7 lg:p-10 bg-gradient-to-br from-primary via-mocha to-caramel shadow-warm"
      >
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-peach/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-honey/15 rounded-full blur-2xl" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-5">
          <motion.div animate={{ y:[0,-10,0] }} transition={{ duration:3, repeat:Infinity, ease: 'easeInOut' }} className="text-7xl lg:text-8xl">🥐</motion.div>
          <div className="text-center lg:text-left">
            <h2 className="text-3xl lg:text-5xl font-bold font-playfair text-vanilla mb-3">¡Hola, {user.username}!</h2>
            <p className="text-peach/70 text-sm mb-4 font-medium">Bienvenido de vuelta a tu panel de control</p>
            <span className="inline-block px-5 py-2 bg-white/15 backdrop-blur-sm rounded-full text-vanilla text-xs font-semibold border border-white/20 shadow-glass">
              {user.role === 'superadmin' && '👑 Dueño / Super Admin'}
              {user.role === 'admin' && '🔑 Administrador'}
              {user.role === 'baker' && '👨‍🍳 Panadero Jefe'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid — Vintage Cards with Glassmorphism */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Recetas',    value: stats.recipes, icon: '📖', gradient: 'from-peach/30 to-blush/20', border: 'border-peach/30', view: 'recipes',   enabled: true },
          { label: 'Inventario', value: PERMS.canViewInventory(user.role) ? stats.inventory : '—', icon: '🛒', gradient: 'from-honey/30 to-vanilla/20', border: 'border-honey/30', view: 'inventory', enabled: PERMS.canViewInventory(user.role) },
          { label: 'Porciones', value: stats.recipes > 0 ? Math.floor(stats.recipes * 3) : '—', icon: '🥐', gradient: 'from-blush/30 to-peach/20', border: 'border-blush/30', view: 'calculator', enabled: PERMS.canUseCalculator(user.role) },
          { label: 'Insumos',    value: PERMS.canViewInventory(user.role) ? stats.inventory : '—', icon: '📦', gradient: 'from-wheat/40 to-latte/30', border: 'border-wheat/40', view: 'inventory', enabled: PERMS.canViewInventory(user.role) },
        ].map((stat, i) => (
          <motion.button
            key={stat.label}
            initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={{ y:-6, boxShadow: '0 15px 35px rgba(107, 68, 35, 0.15)' }} whileTap={{ scale:0.95 }}
            onClick={() => stat.enabled && onNavigate(stat.view)}
            disabled={!stat.enabled}
            className={`rounded-3xl p-5 lg:p-6 text-left shadow-glass transition-all duration-300 border-2 backdrop-blur-sm ${
              stat.enabled
                ? `bg-gradient-to-br ${stat.gradient} ${stat.border} hover:shadow-warm cursor-pointer`
                : 'bg-latte/30 opacity-40 cursor-not-allowed border-latte/30'
            }`}
          >
            <motion.div animate={{ scale:[1,1.1,1] }} transition={{ duration:3, repeat:Infinity, delay: i*0.4 }} className="text-4xl mb-3">{stat.icon}</motion.div>
            <p className="text-xs font-semibold opacity-70 mb-1 text-primary dark:text-vanilla tracking-wide">{stat.label}</p>
            <p className="text-3xl font-bold text-primary dark:text-vanilla">{stat.value}</p>
          </motion.button>
        ))}
      </div>

      {/* Action Buttons — Vintage Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.button
          initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }}
          whileHover={{ scale:1.02, boxShadow:'0 20px 50px rgba(107, 68, 35, 0.2)' }} whileTap={{ scale:0.97 }}
          onClick={() => onNavigate('recipes')}
          className="w-full bg-gradient-to-r from-primary via-mocha to-primary text-vanilla py-5 rounded-3xl font-bold text-xl flex items-center justify-center gap-4 transition-all shadow-warm border border-caramel/20"
        >
          <motion.span animate={{ rotate:[0,8,-8,0] }} transition={{ duration:3, repeat:Infinity }}><BookOpen size={26}/></motion.span>
          <span>📖 Recetas</span>
        </motion.button>

        <motion.button
          initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.25 }}
          whileHover={{ scale:1.02, boxShadow:'0 20px 50px rgba(196, 149, 106, 0.25)' }} whileTap={{ scale:0.97 }}
          onClick={() => onNavigate('calculator')}
          className="w-full bg-gradient-to-r from-caramel via-secondary to-caramel text-flour py-5 rounded-3xl font-bold text-xl flex items-center justify-center gap-4 transition-all shadow-warm border border-honey/30"
        >
          <motion.span animate={{ rotate:[-8,8,-8] }} transition={{ duration:2.5, repeat:Infinity }}><Zap size={26}/></motion.span>
          <span>🧮 Escalar Receta</span>
        </motion.button>

        {PERMS.canViewInventory(user.role) && (
          <>
            <motion.button
              initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3 }}            
              whileHover={{ scale:1.02, boxShadow:'0 20px 50px rgba(212, 165, 116, 0.2)' }} whileTap={{ scale:0.97 }}
              onClick={() => onNavigate('inventory')}
              className="w-full bg-gradient-to-r from-mocha via-primary to-mocha text-vanilla py-5 rounded-3xl font-bold text-xl flex items-center justify-center gap-4 transition-all shadow-warm border border-caramel/20"
            >
              <motion.span animate={{ y:[0,-4,0] }} transition={{ duration:2, repeat:Infinity }}><ShoppingCart size={26}/></motion.span>
              <span>🛒 Inventario</span>
            </motion.button>

            {PERMS.canViewCosts(user.role) && (
              <motion.button
                initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.35 }}
                whileHover={{ scale:1.02, boxShadow:'0 20px 50px rgba(245, 193, 108, 0.2)' }} whileTap={{ scale:0.97 }}
                onClick={() => onNavigate('costs')}
                className="w-full bg-gradient-to-r from-honey via-caramel to-honey text-primary py-5 rounded-3xl font-bold text-xl flex items-center justify-center gap-4 transition-all shadow-warm border border-vanilla/30"
              >
                <motion.span animate={{ scale:[1,1.15,1] }} transition={{ duration:2, repeat:Infinity }}><TrendingUp size={26}/></motion.span>
                <span>💰 Análisis Costos</span>
              </motion.button>
            )}
          </>
        )}
      </div>

      {/* Info footer - Vintage badges */}
      <motion.div
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { icon:'✨', text:'Glassmorphism UI' },
          { icon:'⚡', text:'Ultra rápido' },
          { icon:'💾', text:'Guarda offline' },
        ].map((info) => (
          <div key={info.text} className="glass-card bg-gradient-to-br from-vanilla/60 to-wheat/40 border border-caramel/20 rounded-2xl p-4 text-center shadow-glass">
            <div className="text-2xl mb-1">{info.icon}</div>
            <p className="text-xs font-semibold text-primary/80 dark:text-vanilla/80">{info.text}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// MOBILE NAVBAR - ULTRA DINÁMICA
// ============================================================================

const MobileNavbar: React.FC<{
  user: User;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}> = ({ user, currentView, onViewChange, onLogout }) => {
  const navItems = [
    { id: 'home',       label: 'Inicio',     icon: '🏠', color: 'text-amber-300',   dot: 'bg-amber-400'   },
    { id: 'recipes',    label: 'Recetas',    icon: '📖', color: 'text-orange-300',  dot: 'bg-orange-400'  },
    ...(PERMS.canUseCalculator(user.role) ? [{ id: 'calculator', label: 'Calcular',   icon: '🧮', color: 'text-yellow-300', dot: 'bg-yellow-400' }] : []),
    ...(PERMS.canViewInventory(user.role) ? [{ id: 'inventory',  label: 'Inventario', icon: '🛒', color: 'text-blue-300',   dot: 'bg-blue-400'   }] : []),
    ...(PERMS.canViewCosts(user.role)     ? [{ id: 'costs',      label: 'Costos',     icon: '💰', color: 'text-green-300',  dot: 'bg-green-400'  }] : []),
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-primary/98 to-primary/90 backdrop-blur-xl border-t border-secondary/20 z-40 shadow-2xl pb-safe"
    >
      <div className="flex justify-around items-end px-1 pt-2 pb-3">
        {navItems.map((item) => {
          const active = currentView === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.82 }}
              onClick={() => onViewChange(item.id)}
              className="flex-1 flex flex-col items-center gap-1 relative py-1 px-0.5 rounded-xl transition-all min-w-0"
            >
              {active && (
                <motion.div
                  layoutId="mobileActiveNav"
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  transition={{ type:'spring', stiffness:400, damping:30 }}
                />
              )}
              {/* Active indicator dot */}
              {active && (
                <motion.div
                  layoutId="mobileDot"
                  className={`absolute -top-1 w-6 h-1 rounded-full ${item.dot}`}
                  transition={{ type:'spring', stiffness:400, damping:30 }}
                />
              )}
              <motion.span
                animate={active ? { scale:[1,1.25,1] } : { scale:1 }}
                transition={{ duration:0.4 }}
                className="text-2xl relative z-10"
              >
                {item.icon}
              </motion.span>
              <span className={`text-[9px] font-black relative z-10 leading-none truncate w-full text-center ${
                active ? item.color : 'text-cream/45'
              }`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}

        {/* Logout compact */}
        <motion.button
          whileTap={{ scale:0.82 }}
          onClick={onLogout}
          className="flex-none flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-red-300/60 hover:text-red-300 transition-colors"
        >
          <LogOut size={22} />
          <span className="text-[9px] font-black leading-none">Salir</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

// ============================================================================
// RECIPES VIEW - INTERFAZ ADMIN vs PANADERO - COLORES PANADERÍA
// ============================================================================

const RecipesView: React.FC<{ user: User | null; isMobile?: boolean }> = ({ user, isMobile = true }) => {
  const state = useAppState();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | 'Panadería' | 'Pastelería'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Recipe>>({
    category: 'Panadería',
    ingredients: [],
    temperature: 180,
    time: 30,
  });

  // Roles: superadmin/admin = gestión completa | baker = CRUD recetas + ver inventario (sin costos)
  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin';
  const isBaker = user?.role === 'baker';
  const canEdit = isAdmin || isBaker;

  useEffect(() => {
    let filtered = state.recipes;

    if (category !== 'all') {
      filtered = filtered.filter((r) => r.category === category);
    }
    if (search) {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    // Todos los usuarios ven todas las recetas
    setRecipes(filtered);
  }, [state.recipes, search, category, user]);

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.ingredients?.length) {
      alert('❌ Completa: nombre e ingredientes');
      return;
    }

    if (editingId) {
      const existingRecipe = state.recipes.find((r) => r.id === editingId);
      state.updateRecipe(editingId, {
        id: editingId,
        name: formData.name,
        category: formData.category || 'Panadería',
        ingredients: formData.ingredients,
        temperature: formData.temperature || 180,
        time: formData.time || 30,
        instructions: formData.instructions || '',
        createdBy: existingRecipe?.createdBy || user?.username || '',
        createdAt: existingRecipe?.createdAt || new Date().toISOString(),
      } as Recipe);
      setEditingId(null);
    } else {
      const newRecipe: Recipe = {
        id: Date.now().toString() + Math.random(),
        name: formData.name,
        category: formData.category || 'Panadería',
        ingredients: formData.ingredients,
        temperature: formData.temperature || 180,
        time: formData.time || 30,
        instructions: formData.instructions || '',
        createdBy: user?.username || '',
        createdAt: new Date().toISOString(),
      };
      state.addRecipe(newRecipe);
    }

    setFormData({
      category: 'Panadería',
      ingredients: [],
      temperature: 180,
      time: 30,
    });
    setShowForm(false);
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingId(recipe.id);
    setFormData(recipe);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta receta?')) {
      state.deleteRecipe(id);
    }
  };

  // Añade un ingrediente desde el inventario con su unidad predeterminada
  const addIngredientFromInventory = (operationId: string) => {
    const operation = state.operations.find(op => op.id === operationId);
    if (!operation) return;
    
    const ingredients = formData.ingredients || [];
    // Verificar si ya existe este ingrediente
    const exists = ingredients.some(ing => 
      normalizeIngredientName(ing.name) === normalizeIngredientName(operation.name)
    );
    if (exists) {
      alert('Este ingrediente ya está en la receta');
      return;
    }
    
    // Convertir tipo de inventario a unidad de receta
    const unitMap: Record<string, Ingredient['unit']> = {
      'kg': 'g',
      'L': 'ml',
      'unid': 'unid',
    };
    
    ingredients.push({
      id: Math.random().toString(),
      name: operation.name,
      quantity: 0,
      unit: unitMap[operation.type] || 'g',
    });
    setFormData({ ...formData, ingredients });
  };

  const updateIngredient = (id: string, field: string, value: any) => {
    const ingredients = (formData.ingredients || []).map((ing) =>
      ing.id === id ? { ...ing, [field]: value } : ing
    );
    setFormData({ ...formData, ingredients });
  };

  const removeIngredient = (id: string) => {
    const ingredients = (formData.ingredients || []).filter((ing) => ing.id !== id);
    setFormData({ ...formData, ingredients });
  };

  // ============================================================================
  // MODO EDICIÓN (admin, superadmin, baker) — CRUD completo de recetas
  // ============================================================================
  if (canEdit) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24">
        {/* Header Premium - Vintage Style */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 bg-gradient-to-b from-primary via-mocha to-caramel/90 dark:from-[#1A0D08] dark:via-[#201210] dark:to-[#251410] z-10 pt-5 pb-4 space-y-4 -mx-4 px-4 rounded-b-[32px] shadow-warm dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-colors duration-300"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-4xl"
            >
              {isBaker ? '👨‍🍳' : '👑'}
            </motion.div>
            <div>
              <p className="text-xs font-medium text-vanilla/70 tracking-wide">
                {isBaker ? 'Modo Panadero' : 'Modo Administrador'}
              </p>
              <h2 className="text-2xl font-bold text-vanilla font-playfair tracking-wide">Gestión de Recetas</h2>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              placeholder="🔍 Buscar receta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-5 py-4 rounded-2xl bg-white/15 backdrop-blur-sm border-2 border-peach/30 text-lg font-medium text-vanilla placeholder-vanilla/50 shadow-glass focus:shadow-warm focus:border-peach/50 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                setEditingId(null);
                setFormData({
                  category: 'Panadería',
                  ingredients: [],
                  temperature: 180,
                  time: 30,
                });
                setShowForm(!showForm);
              }}
              className="bg-gradient-to-br from-peach to-caramel hover:from-caramel hover:to-peach text-primary p-4 rounded-2xl font-bold transition-all shadow-warm hover:shadow-glass-lg"
            >
              <Plus size={26} />
            </motion.button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(['all', 'Panadería', 'Pastelería'] as const).map((cat, idx) => (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  category === cat
                    ? 'bg-gradient-to-r from-peach to-vanilla text-primary shadow-warm border border-white/30'
                    : 'bg-white/15 backdrop-blur-sm text-vanilla/80 border border-white/20 hover:bg-white/25'
                }`}
              >
                {cat === 'all' ? '📚 Todas' : cat === 'Panadería' ? '🍞 Pan' : '🎂 Pastel'}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Form Modal - Admin */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card bg-gradient-to-br from-vanilla/90 to-wheat/80 dark:from-[#251410]/95 dark:to-[#1A0D08]/95 border border-caramel/25 dark:border-amber-800/25 rounded-[28px] p-6 shadow-warm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-colors duration-300"
            >
              <form onSubmit={handleSaveRecipe} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold mb-2 block text-primary dark:text-amber-100 tracking-wide">📝 Nombre de Receta</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-caramel/30 focus:border-caramel dark:focus:border-amber-600 bg-white/80 dark:bg-[#1A0D08]/80 dark:text-amber-100 dark:placeholder-amber-200/40 text-lg font-medium transition-all shadow-inner dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold mb-2 block text-primary dark:text-amber-100 tracking-wide">📂 Categoría</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-caramel/30 focus:border-caramel dark:focus:border-amber-600 bg-white/80 dark:bg-[#1A0D08]/80 dark:text-amber-100 font-medium transition-all"
                    >
                      <option>Panadería</option>
                      <option>Pastelería</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-2 block text-primary dark:text-amber-100 tracking-wide">🌡️ Temperatura</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="number"
                      value={formData.temperature || 180}
                      onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
                      className="w-full px-4 py-3.5 rounded-2xl border-2 border-caramel/30 focus:border-caramel dark:focus:border-amber-600 bg-white/80 dark:bg-[#1A0D08]/80 dark:text-amber-100 font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-2 block text-primary dark:text-amber-100 tracking-wide">⏱️ Tiempo (minutos)</label>
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="number"
                    value={formData.time || 30}
                    onChange={(e) => setFormData({ ...formData, time: Number(e.target.value) })}
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-caramel/30 focus:border-caramel dark:focus:border-amber-600 bg-white/80 dark:bg-[#1A0D08]/80 dark:text-amber-100 font-medium transition-all"
                  />
                </div>

                <div>
                  <div className="flex flex-col gap-2 mb-3">
                    <label className="text-xs font-semibold text-primary dark:text-amber-100 tracking-wide">🥄 Ingredientes (del inventario)</label>
                    <div className="flex gap-2">
                      <select
                        id="inventoryIngredientSelect"
                        className="flex-1 px-3 py-2.5 rounded-xl border-2 border-caramel/30 focus:border-caramel dark:focus:border-amber-600 bg-white/80 dark:bg-[#1A0D08]/80 dark:text-amber-100 text-sm font-medium transition-all"
                        defaultValue=""
                      >
                        <option value="" disabled>-- Selecciona del inventario --</option>
                        {state.operations.map((op) => {
                          const alreadyAdded = (formData.ingredients || []).some(ing => 
                            normalizeIngredientName(ing.name) === normalizeIngredientName(op.name)
                          );
                          return (
                            <option key={op.id} value={op.id} disabled={alreadyAdded}>
                              {op.name} ({op.type}) {alreadyAdded ? '✓ Añadido' : ''}
                            </option>
                          );
                        })}
                      </select>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => {
                          const select = document.getElementById('inventoryIngredientSelect') as HTMLSelectElement;
                          if (select && select.value) {
                            addIngredientFromInventory(select.value);
                            select.value = '';
                          }
                        }}
                        className="text-primary dark:text-amber-100 text-sm font-semibold bg-gradient-to-r from-peach/60 to-caramel/40 dark:from-amber-800/60 dark:to-amber-700/40 px-4 py-2.5 rounded-xl transition-all border border-caramel/40 dark:border-amber-700/50 hover:from-peach/80 hover:to-caramel/60 dark:hover:from-amber-700/60 dark:hover:to-amber-600/50 shadow-sm"
                      >
                        + Añadir
                      </motion.button>
                    </div>
                    {state.operations.length === 0 && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">⚠️ No hay ingredientes en el inventario. Agrega insumos primero.</p>
                    )}
                  </div>
                  
                  {/* Lista de ingredientes añadidos */}
                  {(formData.ingredients || []).length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      <p className="text-xs font-medium text-mocha/70 dark:text-amber-200/60">Ingredientes añadidos:</p>
                      {(formData.ingredients || []).map((ing) => (
                        <div key={ing.id} className="flex gap-2 items-center bg-vanilla/50 dark:bg-amber-900/30 p-2 rounded-xl border border-caramel/20 dark:border-amber-700/30">
                          <span className="flex-1 text-sm font-medium text-primary dark:text-amber-100 truncate">
                            📦 {ing.name}
                          </span>
                          <input
                            type="number"
                            placeholder="Cant."
                            step="0.1"
                            min="0"
                            value={ing.quantity || ''}
                            onChange={(e) => updateIngredient(ing.id, 'quantity', Number(e.target.value))}
                            className="w-20 px-3 py-2 rounded-xl border-2 border-caramel/25 focus:border-caramel dark:focus:border-amber-600 bg-white/80 dark:bg-[#1A0D08]/80 dark:text-amber-100 text-sm font-medium transition-all text-center"
                          />
                          <select
                            value={ing.unit}
                            onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
                            className="px-3 py-2 rounded-xl border-2 border-caramel/25 focus:border-caramel dark:focus:border-amber-600 bg-white/80 dark:bg-[#1A0D08]/80 dark:text-amber-100 text-sm font-medium transition-all"
                          >
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                            <option value="ml">ml</option>
                            <option value="L">L</option>
                            <option value="unid">unid</option>
                          </select>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => removeIngredient(ing.id)}
                            className="bg-red-400/30 hover:bg-red-400/50 text-red-600 dark:text-red-400 p-2 rounded-xl transition-all hover:shadow-glass"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-primary to-mocha hover:from-mocha hover:to-primary text-vanilla px-4 py-3.5 rounded-2xl font-semibold transition-all text-lg shadow-warm hover:shadow-glass-lg"
                  >
                    ✨ {editingId ? 'Actualizar' : 'Crear Receta'}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="flex-1 bg-latte/60 hover:bg-latte/80 text-primary px-4 py-3.5 rounded-2xl font-semibold transition-all text-lg border border-caramel/25"
                  >
                    ✕ Cancelar
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recipes List - Admin View - Vintage Cards */}
        <div className={`${isMobile ? 'grid gap-4' : 'grid grid-cols-2 lg:grid-cols-3 gap-5'}`}>
          {recipes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 col-span-full"
            >
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-7xl mb-4"
              >
                📖
              </motion.div>
              <p className="font-semibold text-lg text-primary dark:text-vanilla">No hay recetas aún</p>
              <p className="text-sm opacity-60 text-mocha">{search || category !== 'all' ? 'Intenta con otro filtro' : 'Crea tu primera receta'}</p>
            </motion.div>
          ) : (
            recipes.map((recipe, idx) => (
              <motion.div
                key={recipe.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(196, 149, 106, 0.25)' }}
                className="card-vintage bg-gradient-to-br from-vanilla/95 to-wheat/90 dark:from-mocha/90 dark:to-cocoa/80 border-2 border-caramel/40 dark:border-caramel/30 rounded-3xl p-6 hover:shadow-warm transition-all cursor-pointer active:scale-95 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold font-serif text-primary dark:text-vanilla mb-2">
                      {recipe.name}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-gradient-to-r from-peach/50 to-caramel/40 text-primary dark:text-vanilla text-xs rounded-full font-semibold border border-caramel/30 dark:border-caramel/40">
                        {recipe.category === 'Panadería' ? '🍞' : '🎂'} {recipe.category}
                      </span>
                      <span className="px-3 py-1 bg-blush/40 dark:bg-mocha/50 text-primary dark:text-vanilla text-xs rounded-full font-semibold border border-blush/50 dark:border-caramel/30">
                        👨‍🍳 {recipe.createdBy}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(recipe);
                      }}
                      className="bg-secondary/30 hover:bg-secondary/50 text-primary dark:text-vanilla p-3 rounded-xl transition-all hover:shadow-lg border border-caramel/20"
                    >
                      <Edit2 size={20} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(recipe.id);
                      }}
                      className="bg-blush/40 hover:bg-blush/60 text-primary dark:text-blush p-3 rounded-xl transition-all hover:shadow-lg border border-blush/30"
                    >
                      <Trash2 size={20} />
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="glass-warm bg-gradient-to-br from-peach/50 to-vanilla/40 dark:from-mocha/50 dark:to-mocha/30 p-3 rounded-xl border border-caramel/25">
                    <p className="opacity-70 text-xs font-semibold text-primary dark:text-vanilla">🥄 ING</p>
                    <p className="font-bold text-lg text-primary dark:text-peach">{recipe.ingredients.length}</p>
                  </div>
                  <div className="glass-warm bg-gradient-to-br from-blush/50 to-vanilla/40 dark:from-mocha/50 dark:to-mocha/30 p-3 rounded-xl border border-blush/30">
                    <p className="opacity-70 text-xs font-semibold text-primary dark:text-vanilla">🌡️ T</p>
                    <p className="font-bold text-lg text-primary dark:text-blush">{recipe.temperature}°</p>
                  </div>
                  <div className="glass-warm bg-gradient-to-br from-honey/50 to-vanilla/40 dark:from-mocha/50 dark:to-mocha/30 p-3 rounded-xl border border-honey/30">
                    <p className="opacity-70 text-xs font-semibold text-primary dark:text-vanilla">⏱️ T</p>
                    <p className="font-bold text-lg text-primary dark:text-honey">{recipe.time}m</p>
                  </div>
                </div>

                <p className="text-xs text-mocha dark:text-latte line-clamp-2 font-medium opacity-80">
                  {recipe.ingredients.map(ing => `${ing.name}`).join(' • ')}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    );
  }

  // MODO LECTURA — este código ya no se usa porque todos los roles actuales pueden editar
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24">
      {/* Header lectura */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 glass-warm bg-gradient-to-b from-mocha via-primary/95 to-cinnamon/90 dark:from-cocoa dark:via-mocha/95 dark:to-primary/80 z-10 pt-4 pb-3 space-y-3 -mx-3 px-3 rounded-b-3xl shadow-warm"
      >
        <div className="flex items-center gap-3 mb-2">
          <motion.div animate={{ y: [0,-5,0] }} transition={{ duration:2, repeat:Infinity }} className="text-3xl">
            📚
          </motion.div>
          <div>
            <p className="text-xs font-semibold text-vanilla/80">
              MODO LECTURA
            </p>
            <h2 className="text-xl font-bold text-cream font-serif">Recetas</h2>
          </div>
          <span className="ml-auto text-xs bg-white/20 text-cream/90 font-semibold px-3 py-1 rounded-full border border-cream/30">
            👁️ Solo lectura
          </span>
        </div>

        <input
          type="text"
          placeholder="🔍 Buscar receta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-5 py-3 rounded-2xl bg-cream/90 dark:bg-mocha/40 border-2 border-caramel/30 dark:border-caramel/40 text-base font-medium text-primary dark:text-vanilla placeholder-mocha/60 dark:placeholder-latte/60 focus:outline-none focus:border-caramel transition-all"
        />

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(['all', 'Panadería', 'Pastelería'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-peach text-primary shadow-md'
                  : 'bg-cream/30 dark:bg-mocha/40 text-cream dark:text-vanilla'
              }`}
            >
              {cat === 'all' ? '📚 Todas' : cat === 'Panadería' ? '🍞 Pan' : '🎂 Pastel'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Recipe cards — solo ver */}
      <div className={`${isMobile ? 'grid gap-3' : 'grid grid-cols-2 lg:grid-cols-3 gap-6'}`}>
        {recipes.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-lg text-mocha">Sin resultados</p>
          </div>
        ) : (
          recipes.map((recipe, idx) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity:0, x:-20, scale:0.95 }}
              animate={{ opacity:1, x:0, scale:1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ x:4, boxShadow:'0 12px 28px rgba(196, 149, 106, 0.2)' }}
              className="card-vintage bg-gradient-to-br from-vanilla/95 to-wheat/85 dark:from-mocha/50 dark:to-cocoa/60 border-2 border-caramel/30 dark:border-caramel/40 rounded-3xl p-5 transition-all"
            >
              <h3 className="text-xl font-bold font-serif text-primary dark:text-vanilla mb-2">{recipe.name}</h3>
              <span className="px-3 py-1 bg-peach/50 text-primary dark:text-vanilla text-xs rounded-full font-semibold border border-caramel/30 inline-block mb-3">
                {recipe.category === 'Panadería' ? '🍞' : '🎂'} {recipe.category}
              </span>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="glass-warm bg-blush/40 dark:bg-mocha/40 p-2 rounded-xl text-center border border-blush/40 dark:border-caramel/30">
                  <p className="text-[10px] font-semibold text-primary/70 dark:text-vanilla/70">🌡️ TEMP</p>
                  <p className="font-bold text-lg text-primary dark:text-blush">{recipe.temperature}°</p>
                </div>
                <div className="glass-warm bg-honey/40 dark:bg-mocha/40 p-2 rounded-xl text-center border border-honey/40 dark:border-caramel/30">
                  <p className="text-[10px] font-semibold text-primary/70 dark:text-vanilla/70">⏱️ TIEMPO</p>
                  <p className="font-bold text-lg text-primary dark:text-honey">{recipe.time}m</p>
                </div>
              </div>
              <div className="glass bg-cream/60 dark:bg-mocha/30 rounded-2xl p-3 max-h-48 overflow-y-auto border border-caramel/20 dark:border-caramel/30">
                <p className="text-[10px] font-semibold text-primary/70 dark:text-vanilla/70 mb-1">🥄 INGREDIENTES ({recipe.ingredients.length})</p>
                {recipe.ingredients.map((ing) => (
                  <p key={ing.id} className="text-sm font-medium text-primary dark:text-vanilla">
                    • {ing.name} <span className="text-xs opacity-60">{ing.quantity}{ing.unit}</span>
                  </p>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// CALCULATOR VIEW
// ============================================================================

const CalculatorView: React.FC = () => {
  const state = useAppState();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [scaleType, setScaleType] = useState<'quantity' | 'ingredient'>('quantity');
  const [baseIngredientId, setBaseIngredientId] = useState<string | null>(null);
  const [baseValue, setBaseValue] = useState<number>(0);
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [scaledRecipe, setScaledRecipe] = useState<Recipe | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [cooked, setCooked] = useState<boolean>(false);

  const selectedRecipe = state.recipes.find((r) => r.id === selectedRecipeId);

  const calculateTotalMass = (recipe: Recipe) => {
    return recipe.ingredients.reduce((sum, ing) => {
      const value = ing.unit === 'kg' || ing.unit === 'L' ? ing.quantity * 1000 : ing.quantity;
      return sum + value;
    }, 0);
  };

  // Función para verificar si hay suficiente stock
  const checkSufficientStock = (recipe: Recipe): { sufficient: boolean; missing: { name: string; required: number; available: number; unit: string }[] } => {
    const missing: { name: string; required: number; available: number; unit: string }[] = [];
    
    for (const ing of recipe.ingredients) {
      const operation = state.operations.find(
        (op) => normalizeIngredientName(op.name) === normalizeIngredientName(ing.name) ||
                normalizeIngredientName(op.name).includes(normalizeIngredientName(ing.name)) ||
                normalizeIngredientName(ing.name).includes(normalizeIngredientName(op.name))
      );
      
      if (operation) {
        // Convertir a gramos/ml para comparar
        const requiredGrams = ing.unit === 'kg' || ing.unit === 'L' ? ing.quantity * 1000 : ing.quantity;
        
        if (operation.stockQuantity < requiredGrams) {
          missing.push({
            name: ing.name,
            required: requiredGrams,
            available: operation.stockQuantity,
            unit: operation.type === 'unid' ? 'unid' : (operation.type === 'kg' ? 'g' : 'ml')
          });
        }
      }
    }
    
    return { sufficient: missing.length === 0, missing };
  };

  // Función para cocinar y descontar del inventario
  const handleCook = () => {
    if (!scaledRecipe) return;
    
    const stockCheck = checkSufficientStock(scaledRecipe);
    if (!stockCheck.sufficient) {
      const missingList = stockCheck.missing.map(m => 
        `${m.name}: necesitas ${m.required.toFixed(0)}${m.unit}, tienes ${m.available.toFixed(0)}${m.unit}`
      ).join('\n');
      alert(`❌ Stock insuficiente:\n\n${missingList}`);
      return;
    }
    
    // Descontar de inventario
    for (const ing of scaledRecipe.ingredients) {
      const operation = state.operations.find(
        (op) => normalizeIngredientName(op.name) === normalizeIngredientName(ing.name) ||
                normalizeIngredientName(op.name).includes(normalizeIngredientName(ing.name)) ||
                normalizeIngredientName(ing.name).includes(normalizeIngredientName(op.name))
      );
      
      if (operation) {
        const usedGrams = ing.unit === 'kg' || ing.unit === 'L' ? ing.quantity * 1000 : ing.quantity;
        const newStock = Math.max(0, operation.stockQuantity - usedGrams);
        
        state.updateOperation(operation.id, {
          ...operation,
          stockQuantity: newStock
        });
      }
    }
    
    setCooked(true);
    setTimeout(() => setCooked(false), 3000);
  };

  const handleScale = () => {
    if (!selectedRecipe) return;

    let calculatedScale = 1;

    if (scaleType === 'ingredient' && baseIngredientId && baseValue > 0) {
      const baseIng = selectedRecipe.ingredients.find((i) => i.id === baseIngredientId);
      if (!baseIng) return;
      const baseInG = baseIng.unit === 'kg' || baseIng.unit === 'L' ? baseIng.quantity * 1000 : baseIng.quantity;
      calculatedScale = baseValue / baseInG;
    } else if (scaleType === 'quantity' && productQuantity > 0) {
      calculatedScale = productQuantity;
    }

    const scaled: Recipe = {
      ...selectedRecipe,
      ingredients: selectedRecipe.ingredients.map((ing) => ({
        ...ing,
        quantity: ing.quantity * calculatedScale,
      })),
    };

    setScale(calculatedScale);
    setScaledRecipe(scaled);
    setCooked(false); // Reset cooked state
  };

  const exportImage = async () => {
    if (!scaledRecipe) return;
    const element = document.getElementById('recipe-export');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#FDFBF7',
        scale: 2,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${scaledRecipe.name}-escalada.png`;
      link.click();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24">
      <div className="space-y-3">
        <label className="block text-lg font-bold text-primary dark:text-vanilla">📖 Selecciona una Receta</label>
        <select
          value={selectedRecipeId || ''}
          onChange={(e) => {
            setSelectedRecipeId(e.target.value);
            setScaledRecipe(null);
            setProductQuantity(1);
          }}
          className="w-full px-4 py-3 rounded-2xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla"
        >
          <option value="">-- Elige una receta --</option>
          {state.recipes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {selectedRecipe && (
        <>
          {/* Vista previa de ingredientes con disponibilidad */}
          <div className="glass-warm bg-cream/70 dark:bg-mocha/50 p-4 rounded-2xl border border-caramel/30">
            <h4 className="font-bold text-sm text-primary dark:text-vanilla mb-3">📦 Disponibilidad de Ingredientes:</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedRecipe.ingredients.map((ing) => {
                const availability = checkIngredientInInventory(ing.name, state.operations);
                return (
                  <div key={ing.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className={availability.available ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                        {availability.available ? '✓' : '✗'}
                      </span>
                      <span className={availability.available ? 'text-primary dark:text-vanilla' : 'text-red-600 dark:text-red-400'}>
                        {ing.name}
                      </span>
                    </div>
                    {!availability.available ? (
                      <span className="px-2 py-0.5 text-xs font-bold bg-red-500/90 text-white rounded-full">
                        AGOTADO
                      </span>
                    ) : (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        En stock
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {(() => {
              const unavailableCount = selectedRecipe.ingredients.filter(
                (ing) => !checkIngredientInInventory(ing.name, state.operations).available
              ).length;
              const totalCount = selectedRecipe.ingredients.length;
              return (
                <div className={`mt-3 pt-3 border-t ${unavailableCount > 0 ? 'border-red-300 dark:border-red-700' : 'border-green-300 dark:border-green-700'}`}>
                  <p className={`text-xs font-semibold ${unavailableCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {unavailableCount > 0 
                      ? `⚠️ ${totalCount - unavailableCount}/${totalCount} ingredientes disponibles`
                      : `✅ ${totalCount}/${totalCount} ingredientes disponibles`
                    }
                  </p>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setScaleType('quantity')}
              className={`p-3 rounded-2xl font-semibold transition text-lg ${
                scaleType === 'quantity'
                  ? 'bg-gradient-to-r from-primary to-mocha text-cream shadow-warm'
                  : 'glass-warm bg-wheat/60 dark:bg-mocha/40 text-primary dark:text-vanilla border border-caramel/20'
              }`}
            >
              🍞 Unidades
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setScaleType('ingredient')}
              className={`p-3 rounded-2xl font-semibold transition text-lg ${
                scaleType === 'ingredient'
                  ? 'bg-gradient-to-r from-primary to-mocha text-cream shadow-warm'
                  : 'glass-warm bg-wheat/60 dark:bg-mocha/40 text-primary dark:text-vanilla border border-caramel/20'
              }`}
            >
              🥄 Ingrediente
            </motion.button>
          </div>

          {scaleType === 'ingredient' && (
            <>
              <div>
                <label className="text-sm font-semibold mb-2 block text-primary dark:text-vanilla">🥄 Ingrediente base</label>
                <select
                  value={baseIngredientId || ''}
                  onChange={(e) => setBaseIngredientId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla mb-3"
                >
                  <option value="">-- Selecciona --</option>
                  {selectedRecipe.ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.quantity}{ing.unit})
                    </option>
                  ))}
                </select>
              </div>
              {baseIngredientId && (
                <div>
                  <label className="text-sm font-semibold mb-2 block text-primary dark:text-vanilla">🎯 Cantidad nueva</label>
                  <input
                    type="number"
                    placeholder="Ej: 500"
                    value={baseValue || ''}
                    onChange={(e) => setBaseValue(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla"
                  />
                </div>
              )}
            </>
          )}

          {scaleType === 'quantity' && (
            <div>
              <label className="text-sm font-semibold mb-2 block text-primary dark:text-vanilla">🍞 ¿Cuántos {selectedRecipe.category === 'Panadería' ? 'panes' : 'pasteles'} quieres hacer?</label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Ej: 5"
                value={productQuantity || 1}
                onChange={(e) => setProductQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-3 rounded-2xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla"
              />
              <p className="text-xs text-mocha/70 dark:text-latte/70 mt-2">
                📏 Masa para 1: {calculateTotalMass(selectedRecipe).toFixed(0)} g | Para {productQuantity}: {(calculateTotalMass(selectedRecipe) * productQuantity).toFixed(0)} g
              </p>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleScale}
            className="w-full bg-gradient-to-r from-primary to-mocha hover:from-mocha hover:to-primary text-cream px-6 py-4 rounded-2xl font-semibold transition disabled:opacity-50 text-lg shadow-warm"
          >
            ⚡ Escalar Receta
          </motion.button>
        </>
      )}

      {scaledRecipe && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          id="recipe-export"
          className="card-vintage bg-gradient-to-br from-vanilla/95 to-wheat/90 dark:from-mocha/80 dark:to-cocoa/90 border-2 border-caramel/40 dark:border-caramel/30 rounded-2xl p-6"
        >
          {/* Header con nombre y categoría */}
          <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 text-xs font-bold bg-caramel/30 text-primary dark:text-peach rounded-full mb-2">
              {scaledRecipe.category === 'Panadería' ? '🍞 Panadería' : '🎂 Pastelería'}
            </span>
            <h2 className="text-2xl font-bold font-serif text-primary dark:text-vanilla">{scaledRecipe.name}</h2>
            <p className="text-sm font-semibold text-secondary dark:text-peach">🔢 {scaleType === 'quantity' ? `${productQuantity} unidades` : `Escalada ${scale.toFixed(2)}x`}</p>
          </div>

          {/* Información de cocción */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="glass-warm bg-gradient-to-br from-blush/50 to-vanilla/40 dark:from-mocha/50 dark:to-mocha/30 p-3 rounded-xl border border-blush/30 text-center">
              <p className="text-2xl mb-1">🌡️</p>
              <p className="text-xs text-mocha/70 dark:text-latte/70 font-medium">Temperatura</p>
              <p className="text-xl font-bold text-primary dark:text-blush">{scaledRecipe.temperature}°C</p>
            </div>
            <div className="glass-warm bg-gradient-to-br from-honey/50 to-vanilla/40 dark:from-mocha/50 dark:to-mocha/30 p-3 rounded-xl border border-honey/30 text-center">
              <p className="text-2xl mb-1">⏱️</p>
              <p className="text-xs text-mocha/70 dark:text-latte/70 font-medium">Tiempo</p>
              <p className="text-xl font-bold text-primary dark:text-honey">{scaledRecipe.time} min</p>
            </div>
            <div className="glass-warm bg-gradient-to-br from-peach/50 to-vanilla/40 dark:from-mocha/50 dark:to-mocha/30 p-3 rounded-xl border border-peach/30 text-center">
              <p className="text-2xl mb-1">📏</p>
              <p className="text-xs text-mocha/70 dark:text-latte/70 font-medium">Masa Total</p>
              <p className="text-xl font-bold text-primary dark:text-peach">{(calculateTotalMass(scaledRecipe) / 1000).toFixed(2)} kg</p>
            </div>
          </div>

          {/* Ingredientes */}
          <div className="space-y-3 mb-4">
            <h3 className="font-bold text-lg text-primary dark:text-vanilla">🥄 Ingredientes:</h3>
            {scaledRecipe.ingredients.map((ing) => {
              const availability = checkIngredientInInventory(ing.name, state.operations);
              return (
                <div key={ing.id} className={`flex justify-between items-center pb-2 border-b ${availability.available ? 'border-caramel/30 dark:border-caramel/40' : 'border-red-400/50 dark:border-red-500/40'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${availability.available ? 'text-primary dark:text-vanilla' : 'text-red-600 dark:text-red-400'}`}>
                      {ing.name}
                    </span>
                    {!availability.available && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-red-500/90 text-white rounded-full animate-pulse">
                        AGOTADO
                      </span>
                    )}
                  </div>
                  <span className={`font-mono font-bold text-lg ${availability.available ? 'text-secondary dark:text-peach' : 'text-red-500 dark:text-red-400'}`}>
                    {ing.quantity.toFixed(2)} {ing.unit}
                  </span>
                </div>
              );
            })}
            
            {/* Resumen de disponibilidad */}
            {(() => {
              const unavailableCount = scaledRecipe.ingredients.filter(
                (ing) => !checkIngredientInInventory(ing.name, state.operations).available
              ).length;
              if (unavailableCount > 0) {
                return (
                  <div className="bg-red-100/80 dark:bg-red-900/30 border border-red-300 dark:border-red-700 p-3 rounded-xl mt-2">
                    <p className="text-red-700 dark:text-red-300 font-semibold text-sm">
                      ⚠️ {unavailableCount} ingrediente{unavailableCount > 1 ? 's' : ''} no disponible{unavailableCount > 1 ? 's' : ''} en inventario
                    </p>
                  </div>
                );
              }
              return (
                <div className="bg-green-100/80 dark:bg-green-900/30 border border-green-300 dark:border-green-700 p-3 rounded-xl mt-2">
                  <p className="text-green-700 dark:text-green-300 font-semibold text-sm">
                    ✅ Todos los ingredientes disponibles en inventario
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Instrucciones */}
          {scaledRecipe.instructions && (
            <div className="glass-warm bg-cream/70 dark:bg-mocha/50 p-4 rounded-xl border border-caramel/30 mb-4">
              <h3 className="font-bold text-sm text-primary dark:text-vanilla mb-2">📝 Instrucciones:</h3>
              <p className="text-sm text-mocha dark:text-latte leading-relaxed">{scaledRecipe.instructions}</p>
            </div>
          )}

          {/* Costo estimado si tiene datos del inventario */}
          {(() => {
            let totalCost = 0;
            let hasFullCostData = true;
            
            scaledRecipe.ingredients.forEach((ing) => {
              const operation = state.operations.find(
                (op) => normalizeIngredientName(op.name) === normalizeIngredientName(ing.name) ||
                        normalizeIngredientName(op.name).includes(normalizeIngredientName(ing.name)) ||
                        normalizeIngredientName(ing.name).includes(normalizeIngredientName(op.name))
              );
              
              if (operation) {
                const totalGrams =
                  operation.type === 'kg' ? operation.presentationWeight * operation.unitsPurchased * 1000 :
                  operation.type === 'L' ? operation.presentationWeight * operation.unitsPurchased * 1000 :
                  operation.presentationWeight * operation.unitsPurchased;
                
                const costPerGram = operation.totalCost / totalGrams;
                const ingGrams = ing.unit === 'kg' || ing.unit === 'L' ? ing.quantity * 1000 : ing.quantity;
                totalCost += costPerGram * ingGrams;
              } else {
                hasFullCostData = false;
              }
            });

            if (totalCost > 0) {
              const formatCurrency = (value: number) => new Intl.NumberFormat('es-CO', {
                style: 'currency', currency: 'COP', minimumFractionDigits: 0
              }).format(value);

              return (
                <div className="glass-warm bg-gradient-to-r from-honey/40 to-caramel/30 dark:from-amber-900/40 dark:to-amber-800/30 p-4 rounded-xl border border-honey/40 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-mocha/70 dark:text-amber-200/70 font-medium">💰 Costo Estimado de Ingredientes</p>
                      <p className="text-2xl font-bold text-primary dark:text-amber-100">{formatCurrency(totalCost)}</p>
                    </div>
                    {!hasFullCostData && (
                      <span className="text-xs bg-orange-400/30 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
                        Parcial
                      </span>
                    )}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Botón COCINAR */}
          {!cooked ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleCook}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2 text-lg shadow-lg mb-3"
            >
              <span className="text-2xl">🍳</span>
              COCINAR - Descontar Ingredientes
            </motion.button>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-lg shadow-lg mb-3"
            >
              <span className="text-2xl">✅</span>
              ¡Ingredientes descontados del inventario!
            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={exportImage}
            className="w-full bg-gradient-to-r from-primary to-mocha hover:from-mocha hover:to-primary text-cream px-6 py-3 rounded-2xl font-semibold transition flex items-center justify-center gap-2 text-lg shadow-warm"
          >
            <Download size={20} />
            📥 DESCARGAR PNG
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

// ============================================================================
// INVENTORY VIEW
// ============================================================================

const InventoryView: React.FC = () => {
  const state = useAppState();
  const user = state.user!;
  const canEdit = PERMS.canEditInventory(user.role);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Operation>>({
    type: 'kg',
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculateCostPer = (op: Operation) => {
    const totalGrams =
      op.type === 'kg'
        ? op.presentationWeight * op.unitsPurchased * 1000
        : op.type === 'L'
        ? op.presentationWeight * op.unitsPurchased * 1000
        : op.presentationWeight * op.unitsPurchased;

    return {
      perGram: op.totalCost / totalGrams,
      per100g: (op.totalCost / totalGrams) * 100,
      perKg: (op.totalCost / totalGrams) * 1000,
    };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !formData.presentationWeight || !formData.unitsPurchased || !formData.totalCost) {
      alert('❌ Completa todos los campos');
      return;
    }

    // Calcular stock inicial si no existe
    const calculateInitialStock = () => {
      if (formData.stockQuantity !== undefined) return formData.stockQuantity;
      const pw = formData.presentationWeight || 0;
      const up = formData.unitsPurchased || 0;
      if (formData.type === 'kg' || formData.type === 'L') {
        return pw * up * 1000; // Convertir a g/ml
      }
      return pw * up; // Unidades
    };

    if (editingId) {
      state.updateOperation(editingId, {
        id: editingId,
        ...formData,
        stockQuantity: formData.stockQuantity ?? calculateInitialStock(),
      } as Operation);
      setEditingId(null);
    } else {
      state.addOperation({
        id: Date.now().toString() + Math.random(),
        ...formData,
        stockQuantity: calculateInitialStock(),
      } as Operation);
    }

    setFormData({ type: 'kg' });
    setShowForm(false);
  };

  const handleEdit = (op: Operation) => {
    setEditingId(op.id);
    setFormData(op);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este insumo?')) {
      state.deleteOperation(id);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24">
      {canEdit && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingId(null);
            setFormData({ type: 'kg' });
            setShowForm(!showForm);
          }}
          className="w-full bg-gradient-to-r from-primary to-mocha hover:from-mocha hover:to-primary text-cream px-6 py-4 rounded-2xl font-semibold transition flex items-center justify-center gap-2 text-lg shadow-warm"
        >
          <Plus size={24} />
          ➕ Nuevo Insumo
        </motion.button>
      )}
      {!canEdit && (
        <div className="flex items-center gap-3 glass-warm bg-vanilla/80 dark:bg-mocha/40 border border-caramel/30 dark:border-caramel/40 rounded-2xl p-4">
          <span className="text-2xl">👁️</span>
          <div>
            <p className="font-semibold text-primary dark:text-vanilla text-sm">Vista de Inventario</p>
            <p className="text-xs text-mocha dark:text-latte">Puedes consultar los insumos y sus costos</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card bg-gradient-to-br from-vanilla/90 to-wheat/80 dark:from-mocha/60 dark:to-cocoa/70 border-2 border-caramel/30 dark:border-caramel/40 rounded-2xl p-4"
          >
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold mb-1 block text-primary dark:text-vanilla">📝 Nombre</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla"
                  placeholder="Ej: Harina Premium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold mb-1 block text-primary dark:text-vanilla">📊 Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla"
                  >
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="unid">Unidad</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block text-primary dark:text-vanilla">⚖️ Peso/Presentación</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.presentationWeight || ''}
                    onChange={(e) => setFormData({ ...formData, presentationWeight: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold mb-1 block text-primary dark:text-vanilla">📦 Unidades</label>
                  <input
                    type="number"
                    value={formData.unitsPurchased || ''}
                    onChange={(e) => setFormData({ ...formData, unitsPurchased: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block text-primary dark:text-vanilla">💰 Costo Total</label>
                  <input
                    type="number"
                    step="100"
                    value={formData.totalCost || ''}
                    onChange={(e) => setFormData({ ...formData, totalCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border-2 border-caramel/30 focus:border-caramel bg-cream/90 dark:bg-mocha/40 dark:border-caramel/40 text-lg font-medium text-primary dark:text-vanilla"
                    placeholder="100000"
                  />
                </div>
              </div>

              {/* Campo de Stock Disponible */}
              <div>
                <label className="text-xs font-semibold mb-1 block text-primary dark:text-vanilla">
                  📦 Stock Disponible ({formData.type === 'unid' ? 'unidades' : formData.type === 'kg' ? 'gramos' : 'mililitros'})
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.stockQuantity || ''}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-green-400/50 focus:border-green-500 bg-green-50/50 dark:bg-green-900/20 dark:border-green-600/40 text-lg font-medium text-primary dark:text-vanilla"
                  placeholder={editingId ? 'Stock actual' : 'Se calcula automáticamente'}
                />
                <p className="text-xs text-mocha/60 dark:text-latte/60 mt-1">
                  {editingId ? '💡 Modifica el stock actual del insumo' : '💡 Se calculará automáticamente al crear'}
                </p>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary to-mocha hover:from-mocha hover:to-primary text-cream px-4 py-2 rounded-xl font-semibold transition text-lg shadow-warm"
                >
                  ✅ {editingId ? 'Actualizar' : 'Crear'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="flex-1 bg-latte/40 hover:bg-latte/60 text-primary dark:text-vanilla px-4 py-2 rounded-xl font-semibold transition text-lg"
                >
                  ✕ Cancelar
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {state.operations.length === 0 ? (
          <motion.div className="text-center py-12 text-mocha dark:text-latte">
            <div className="text-6xl mb-3">🛒</div>
            <p className="font-semibold">Inventario vacío</p>
            <p className="text-xs opacity-70">Agrega insumos para gestionar costos</p>
          </motion.div>
        ) : (
          state.operations.map((op) => {
            const costs = calculateCostPer(op);
            return (
              <motion.div
                key={op.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-vintage bg-gradient-to-br from-vanilla/95 to-wheat/90 dark:from-mocha/70 dark:to-cocoa/80 border-2 border-caramel/30 dark:border-caramel/40 rounded-2xl p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-primary dark:text-vanilla">{op.name}</h3>
                    <p className="text-xs text-mocha/70 dark:text-latte/70">
                      {op.presentationWeight}{op.type} × {op.unitsPurchased}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {canEdit && (
                      <>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(op)}
                          className="bg-secondary/30 hover:bg-secondary/50 text-primary dark:text-vanilla p-2 rounded-xl transition border border-caramel/20"
                        >
                          <Edit2 size={16} />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(op.id)}
                          className="bg-blush/40 hover:bg-blush/60 text-primary dark:text-blush p-2 rounded-xl transition border border-blush/30"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>

                {/* Stock disponible */}
                <div className={`mb-3 p-3 rounded-xl border ${op.stockQuantity > 0 ? 'bg-green-100/60 dark:bg-green-900/30 border-green-400/40' : 'bg-red-100/60 dark:bg-red-900/30 border-red-400/40'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{op.stockQuantity > 0 ? '📦' : '⚠️'}</span>
                      <span className={`font-semibold text-sm ${op.stockQuantity > 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        Stock Disponible
                      </span>
                    </div>
                    <span className={`font-bold text-lg ${op.stockQuantity > 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                      {op.type === 'unid' 
                        ? `${op.stockQuantity} unid` 
                        : op.stockQuantity >= 1000 
                          ? `${(op.stockQuantity / 1000).toFixed(2)} ${op.type}` 
                          : `${op.stockQuantity} ${op.type === 'kg' ? 'g' : 'ml'}`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="glass-warm bg-peach/40 dark:bg-mocha/40 p-2 rounded-xl border border-caramel/25">
                    <p className="text-primary dark:text-peach font-semibold">$ / g</p>
                    <p className="font-bold text-lg text-primary dark:text-vanilla">{formatCurrency(costs.perGram)}</p>
                  </div>
                  <div className="glass-warm bg-honey/40 dark:bg-mocha/40 p-2 rounded-xl border border-honey/30">
                    <p className="text-primary dark:text-honey font-semibold">$ / 100g</p>
                    <p className="font-bold text-lg text-primary dark:text-vanilla">{formatCurrency(costs.per100g)}</p>
                  </div>
                  <div className="glass-warm bg-blush/40 dark:bg-mocha/40 p-2 rounded-xl border border-blush/30">
                    <p className="text-primary dark:text-blush font-semibold">$ / kg</p>
                    <p className="font-bold text-lg text-primary dark:text-vanilla">{formatCurrency(costs.perKg)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// COSTS VIEW - Análisis de Costos y Rentabilidad
// ============================================================================

// ============================================================================
// COMPONENTE GRÁFICO DE BARRAS CSS
// ============================================================================
const BarChart: React.FC<{ data: { label: string; value: number; color: string }[]; maxValue: number; formatValue: (v: number) => string }> = ({ data, maxValue, formatValue }) => (
  <div className="space-y-3">
    {data.map((item, i) => (
      <motion.div key={item.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium text-primary dark:text-vanilla truncate max-w-[60%]">{item.label}</span>
          <span className="font-bold text-mocha/70 dark:text-latte/70">{formatValue(item.value)}</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((item.value / maxValue) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.1 }}
            className={`h-full rounded-full ${item.color}`}
          />
        </div>
      </motion.div>
    ))}
  </div>
);

// ============================================================================
// COMPONENTE GRÁFICO CIRCULAR (DONUT) CSS
// ============================================================================
const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[]; total: number; centerLabel: string }> = ({ data, total, centerLabel }) => {
  let accumulatedPercent = 0;
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-slate-200 dark:text-slate-700" />
          {data.map((item, i) => {
            const percent = total > 0 ? (item.value / total) * 100 : 0;
            const dashArray = (percent / 100) * circumference;
            accumulatedPercent += percent;
            return (
              <motion.circle
                key={item.label}
                cx={size/2} cy={size/2} r={radius}
                fill="none" strokeWidth={strokeWidth}
                stroke={item.color}
                strokeDasharray={`${dashArray} ${circumference}`}
                strokeDashoffset={-((accumulatedPercent - percent) / 100) * circumference}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-primary dark:text-vanilla">{centerLabel}</span>
          <span className="text-xs text-mocha/60 dark:text-latte/60">Total</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 w-full">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="truncate text-mocha/70 dark:text-latte/70">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE MINI SPARKLINE
// ============================================================================
const MiniSparkline: React.FC<{ values: number[]; color: string }> = ({ values, color }) => {
  if (values.length === 0) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const width = 80;
  const height = 30;
  const points = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
      <circle cx={width} cy={height - ((values[values.length - 1] - min) / range) * height} r="3" fill={color} />
    </svg>
  );
};

// ============================================================================
// SISTEMA DE GESTIÓN DE COSTOS - PANCITOS
// ============================================================================
const CostsView: React.FC = () => {
  const state = useAppState();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis' | 'simulator' | 'reports'>('dashboard');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  // Variables del simulador (solo se usan en esa pestaña)
  const [simMargin, setSimMargin] = useState(40);
  const [simQuantity, setSimQuantity] = useState(10);
  const [simRecipeId, setSimRecipeId] = useState<string | null>(null);

  // Formatear moneda colombiana COP
  const formatCOP = (value: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  // =========================================================================
  // CÁLCULOS AUTOMÁTICOS GLOBALES (Solo costos reales, sin margen)
  // =========================================================================
  const globalStats = React.useMemo(() => {
    // Inventario
    const totalInventoryValue = state.operations.reduce((sum, op) => sum + op.totalCost, 0);
    const totalItems = state.operations.length;
    
    // Top 5 ingredientes más costosos
    const sortedOps = [...state.operations].sort((a, b) => b.totalCost - a.totalCost);
    const top5Ingredients = sortedOps.slice(0, 5);

    // Calcular costo de cada receta (SOLO COSTOS, sin margen)
    const recipeCosts = state.recipes.map(recipe => {
      let totalCost = 0;
      let availableCount = 0;
      
      recipe.ingredients.forEach(ing => {
        const op = state.operations.find(o => 
          normalizeIngredientName(o.name) === normalizeIngredientName(ing.name) ||
          normalizeIngredientName(o.name).includes(normalizeIngredientName(ing.name)) ||
          normalizeIngredientName(ing.name).includes(normalizeIngredientName(o.name))
        );
        
        if (op) {
          const totalGrams = op.type === 'kg' || op.type === 'L' ? op.presentationWeight * op.unitsPurchased * 1000 : op.presentationWeight * op.unitsPurchased;
          const costPerGram = op.totalCost / totalGrams;
          const ingGrams = ing.unit === 'kg' || ing.unit === 'L' ? ing.quantity * 1000 : ing.quantity;
          totalCost += costPerGram * ingGrams;
          availableCount++;
        }
      });
      
      return {
        ...recipe,
        totalCost,
        availableIngredients: availableCount,
        totalIngredients: recipe.ingredients.length,
        completeness: recipe.ingredients.length > 0 ? (availableCount / recipe.ingredients.length) * 100 : 0,
      };
    });

    // Rankings por costo
    const sortedByCost = [...recipeCosts].sort((a, b) => b.totalCost - a.totalCost);
    const mostExpensive = sortedByCost.slice(0, 3);
    const cheapest = [...recipeCosts].sort((a, b) => a.totalCost - b.totalCost).slice(0, 3);

    // Margen de ganancia predeterminado (40%)
    const defaultMargin = 40;

    // Agregar ganancia a cada receta
    const recipeCostsWithProfit = recipeCosts.map(r => ({
      ...r,
      suggestedPrice: r.totalCost * (1 + defaultMargin / 100),
      profit: r.totalCost * (defaultMargin / 100),
      margin: defaultMargin,
    }));

    // Rankings por ganancia
    const sortedByProfit = [...recipeCostsWithProfit].sort((a, b) => b.profit - a.profit);
    const mostProfitable = sortedByProfit.slice(0, 3);

    // Totales
    const avgCost = recipeCostsWithProfit.length > 0 ? recipeCostsWithProfit.reduce((s, r) => s + r.totalCost, 0) / recipeCostsWithProfit.length : 0;
    const totalCostAll = recipeCostsWithProfit.reduce((s, r) => s + r.totalCost, 0);
    const minCost = recipeCostsWithProfit.length > 0 ? Math.min(...recipeCostsWithProfit.map(r => r.totalCost)) : 0;
    const maxCost = recipeCostsWithProfit.length > 0 ? Math.max(...recipeCostsWithProfit.map(r => r.totalCost)) : 0;

    // Totales de ganancias
    const totalProfit = recipeCostsWithProfit.reduce((s, r) => s + r.profit, 0);
    const avgProfit = recipeCostsWithProfit.length > 0 ? totalProfit / recipeCostsWithProfit.length : 0;
    const totalRevenue = recipeCostsWithProfit.reduce((s, r) => s + r.suggestedPrice, 0);

    // Por categoría
    const byCategory = {
      'Panadería': recipeCostsWithProfit.filter(r => r.category === 'Panadería'),
      'Pastelería': recipeCostsWithProfit.filter(r => r.category === 'Pastelería'),
    };
    const categoryStats = Object.entries(byCategory).map(([cat, recipes]) => ({
      category: cat,
      count: recipes.length,
      totalCost: recipes.reduce((s, r) => s + r.totalCost, 0),
      avgCost: recipes.length > 0 ? recipes.reduce((s, r) => s + r.totalCost, 0) / recipes.length : 0,
      totalProfit: recipes.reduce((s, r) => s + r.profit, 0),
      avgProfit: recipes.length > 0 ? recipes.reduce((s, r) => s + r.profit, 0) / recipes.length : 0,
    }));

    return {
      totalInventoryValue,
      totalItems,
      top5Ingredients,
      recipeCosts: recipeCostsWithProfit,
      mostExpensive,
      cheapest,
      mostProfitable,
      avgCost,
      totalCostAll,
      minCost,
      maxCost,
      totalProfit,
      avgProfit,
      totalRevenue,
      defaultMargin,
      categoryStats,
      totalRecipes: state.recipes.length,
    };
  }, [state.operations, state.recipes]);

  // Cálculo detallado de receta seleccionada (solo costos base)
  const selectedRecipeAnalysis = React.useMemo(() => {
    const recipe = state.recipes.find(r => r.id === selectedRecipeId);
    if (!recipe) return null;

    const ingredients: { name: string; qty: number; unit: string; cost: number; percent: number; available: boolean }[] = [];
    let totalCost = 0;

    recipe.ingredients.forEach(ing => {
      const op = state.operations.find(o => 
        normalizeIngredientName(o.name) === normalizeIngredientName(ing.name) ||
        normalizeIngredientName(o.name).includes(normalizeIngredientName(ing.name)) ||
        normalizeIngredientName(ing.name).includes(normalizeIngredientName(o.name))
      );

      if (op) {
        const totalGrams = op.type === 'kg' || op.type === 'L' ? op.presentationWeight * op.unitsPurchased * 1000 : op.presentationWeight * op.unitsPurchased;
        const costPerGram = op.totalCost / totalGrams;
        const ingGrams = ing.unit === 'kg' || ing.unit === 'L' ? ing.quantity * 1000 : ing.quantity;
        const cost = costPerGram * ingGrams;
        ingredients.push({ name: ing.name, qty: ing.quantity, unit: ing.unit, cost, percent: 0, available: true });
        totalCost += cost;
      } else {
        ingredients.push({ name: ing.name, qty: ing.quantity, unit: ing.unit, cost: 0, percent: 0, available: false });
      }
    });

    // Calcular porcentajes
    ingredients.forEach(ing => {
      if (ing.available && totalCost > 0) ing.percent = (ing.cost / totalCost) * 100;
    });
    ingredients.sort((a, b) => b.cost - a.cost);

    return { recipe, ingredients, totalCost };
  }, [selectedRecipeId, state.recipes, state.operations]);

  // Cálculo del simulador (con margen personalizado)
  const simulatorData = React.useMemo(() => {
    const recipe = state.recipes.find(r => r.id === simRecipeId);
    if (!recipe) return null;

    let totalCost = 0;
    const ingredients: { name: string; qty: number; unit: string; cost: number; available: boolean }[] = [];

    recipe.ingredients.forEach(ing => {
      const op = state.operations.find(o => 
        normalizeIngredientName(o.name) === normalizeIngredientName(ing.name) ||
        normalizeIngredientName(o.name).includes(normalizeIngredientName(ing.name)) ||
        normalizeIngredientName(ing.name).includes(normalizeIngredientName(o.name))
      );

      if (op) {
        const totalGrams = op.type === 'kg' || op.type === 'L' ? op.presentationWeight * op.unitsPurchased * 1000 : op.presentationWeight * op.unitsPurchased;
        const costPerGram = op.totalCost / totalGrams;
        const ingGrams = ing.unit === 'kg' || ing.unit === 'L' ? ing.quantity * 1000 : ing.quantity;
        const cost = costPerGram * ingGrams;
        ingredients.push({ name: ing.name, qty: ing.quantity, unit: ing.unit, cost, available: true });
        totalCost += cost;
      } else {
        ingredients.push({ name: ing.name, qty: ing.quantity, unit: ing.unit, cost: 0, available: false });
      }
    });

    const costPerUnit = totalCost;
    const pricePerUnit = costPerUnit * (1 + simMargin / 100);
    const profitPerUnit = pricePerUnit - costPerUnit;
    const totalInvestment = costPerUnit * simQuantity;
    const totalRevenue = pricePerUnit * simQuantity;
    const totalProfit = profitPerUnit * simQuantity;

    return { recipe, ingredients, costPerUnit, pricePerUnit, profitPerUnit, totalInvestment, totalRevenue, totalProfit };
  }, [simRecipeId, state.recipes, state.operations, simMargin, simQuantity]);

  // =========================================================================
  // TABS DE NAVEGACIÓN
  // =========================================================================
  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: '📊' },
    { id: 'analysis' as const, label: 'Análisis', icon: '🔍' },
    { id: 'simulator' as const, label: 'Simulador', icon: '🧮' },
    { id: 'reports' as const, label: 'Reportes', icon: '📋' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-24">
      {/* ===== HEADER PRINCIPAL ===== */}
      <div className="glass-warm bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-800 dark:via-teal-800 dark:to-cyan-800 p-5 rounded-2xl border border-emerald-400/30 shadow-warm overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgY3g9IjIwIiBjeT0iMjAiIHI9IjIiLz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
            <TrendingUp size={36} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              💰 Sistema de Gestión de Costos
            </h2>
            <p className="text-emerald-100/80 text-sm mt-1">PANCITOS · Panel de Control Financiero</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{globalStats.totalRecipes}</p>
            <p className="text-xs text-emerald-100/70">recetas</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{globalStats.totalItems}</p>
            <p className="text-xs text-emerald-100/70">insumos</p>
          </div>
        </div>
      </div>

      {/* ===== NAVEGACIÓN POR TABS ===== */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                : 'bg-cream/80 dark:bg-mocha/50 text-mocha/70 dark:text-latte/70 hover:bg-cream dark:hover:bg-mocha/70'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* ===== TAB: DASHBOARD ===== */}
      {activeTab === 'dashboard' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* KPIs Principales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="glass-warm bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 border-2 border-blue-200/50 dark:border-blue-700/40 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl">📦</span>
                <MiniSparkline values={[30, 45, 28, 50, 42, 65]} color="#3b82f6" />
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-300 font-semibold mt-2">Inventario Total</p>
              <p className="text-xl font-bold text-blue-800 dark:text-blue-100">{formatCOP(globalStats.totalInventoryValue)}</p>
              <p className="text-xs text-blue-500/70 dark:text-blue-400/70">{globalStats.totalItems} insumos</p>
            </div>

            <div className="glass-warm bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/30 border-2 border-purple-200/50 dark:border-purple-700/40 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl">📖</span>
                <MiniSparkline values={[20, 35, 40, 38, 45, 50]} color="#a855f7" />
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-300 font-semibold mt-2">Total Recetas</p>
              <p className="text-xl font-bold text-purple-800 dark:text-purple-100">{globalStats.totalRecipes}</p>
              <p className="text-xs text-purple-500/70 dark:text-purple-400/70">Con análisis de costos</p>
            </div>

            <div className="glass-warm bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-800/30 border-2 border-amber-200/50 dark:border-amber-700/40 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl">💵</span>
                <MiniSparkline values={[40, 55, 48, 60, 52, 70]} color="#f59e0b" />
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-300 font-semibold mt-2">Costo Promedio</p>
              <p className="text-xl font-bold text-amber-800 dark:text-amber-100">{formatCOP(globalStats.avgCost)}</p>
              <p className="text-xs text-amber-500/70 dark:text-amber-400/70">Por receta</p>
            </div>

            <div className="glass-warm bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/30 border-2 border-green-200/50 dark:border-green-700/40 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl">📈</span>
                <MiniSparkline values={[50, 65, 58, 75, 68, 85]} color="#22c55e" />
              </div>
              <p className="text-xs text-green-600 dark:text-green-300 font-semibold mt-2">Ganancia Total</p>
              <p className="text-xl font-bold text-green-800 dark:text-green-100">{formatCOP(globalStats.totalProfit)}</p>
              <p className="text-xs text-green-500/70 dark:text-green-400/70">Margen {globalStats.defaultMargin}%</p>
            </div>
          </div>

          {/* Panel de Ganancias */}
          <div className="glass-warm bg-gradient-to-r from-green-500/90 via-emerald-500/90 to-teal-500/90 dark:from-green-800 dark:via-emerald-800 dark:to-teal-800 rounded-2xl p-5 shadow-warm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💰</span>
              <div>
                <h3 className="text-white font-bold text-lg">Resumen de Ganancias</h3>
                <p className="text-white/70 text-xs">Margen automático del {globalStats.defaultMargin}% sobre costo</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <p className="text-white/70 text-xs mb-1">📦 Costo Total</p>
                <p className="text-xl font-bold text-white">{formatCOP(globalStats.totalCostAll)}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <p className="text-white/70 text-xs mb-1">🏷️ Venta Total</p>
                <p className="text-xl font-bold text-white">{formatCOP(globalStats.totalRevenue)}</p>
              </div>
              <div className="bg-white/25 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-white/40">
                <p className="text-white/80 text-xs mb-1">💵 Ganancia Total</p>
                <p className="text-2xl font-bold text-white">{formatCOP(globalStats.totalProfit)}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <p className="text-white/70 text-xs mb-1">📊 Ganancia Prom.</p>
                <p className="text-xl font-bold text-white">{formatCOP(globalStats.avgProfit)}</p>
              </div>
            </div>
          </div>

          {/* Resumen de Costos */}
          <div className="glass-warm bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 rounded-2xl p-5 shadow-warm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📊</span>
              <div>
                <h3 className="text-white font-bold text-lg">Resumen de Costos</h3>
                <p className="text-white/70 text-xs">Análisis automático basado en tu inventario</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <p className="text-white/70 text-xs mb-1">📉 Costo Mínimo</p>
                <p className="text-2xl font-bold text-white">{formatCOP(globalStats.minCost)}</p>
                <p className="text-white/50 text-xs mt-1">Receta más económica</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <p className="text-white/70 text-xs mb-1">📊 Costo Promedio</p>
                <p className="text-2xl font-bold text-white">{formatCOP(globalStats.avgCost)}</p>
                <p className="text-white/50 text-xs mt-1">De {globalStats.totalRecipes} recetas</p>
              </div>
              <div className="bg-white/25 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-white/40">
                <p className="text-white/80 text-xs mb-1">📈 Costo Máximo</p>
                <p className="text-2xl font-bold text-white">{formatCOP(globalStats.maxCost)}</p>
                <p className="text-white/60 text-xs mt-1">Receta más costosa</p>
              </div>
            </div>
          </div>

          {/* Gráficos lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top 5 Ingredientes más costosos */}
            <div className="card-vintage bg-gradient-to-br from-white to-slate-50 dark:from-mocha/80 dark:to-cocoa/70 border-2 border-slate-200/50 dark:border-slate-700/40 rounded-2xl p-5">
              <h3 className="font-bold text-primary dark:text-vanilla mb-4 flex items-center gap-2">
                🥇 Top 5 Insumos Más Costosos
              </h3>
              <BarChart
                data={globalStats.top5Ingredients.map((op, i) => ({
                  label: op.name,
                  value: op.totalCost,
                  color: ['bg-gradient-to-r from-red-400 to-red-500', 'bg-gradient-to-r from-orange-400 to-orange-500', 'bg-gradient-to-r from-amber-400 to-amber-500', 'bg-gradient-to-r from-yellow-400 to-yellow-500', 'bg-gradient-to-r from-lime-400 to-lime-500'][i],
                }))}
                maxValue={globalStats.top5Ingredients[0]?.totalCost || 1}
                formatValue={formatCOP}
              />
            </div>

            {/* Distribución de Ganancias por Categoría */}
            <div className="card-vintage bg-gradient-to-br from-white to-slate-50 dark:from-mocha/80 dark:to-cocoa/70 border-2 border-slate-200/50 dark:border-slate-700/40 rounded-2xl p-5">
              <h3 className="font-bold text-primary dark:text-vanilla mb-4 flex items-center gap-2">
                🥧 Ganancias por Categoría
              </h3>
              <div className="flex justify-center">
                <DonutChart
                  data={globalStats.categoryStats.map((cat, i) => ({
                    label: `${cat.category} (${cat.count})`,
                    value: cat.totalProfit,
                    color: ['#22c55e', '#10b981'][i],
                  }))}
                  total={globalStats.categoryStats.reduce((s, c) => s + c.totalProfit, 0)}
                  centerLabel={formatCOP(globalStats.categoryStats.reduce((s, c) => s + c.totalProfit, 0))}
                />
              </div>
            </div>
          </div>

          {/* Rankings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Más Rentables */}
            <div className="glass-warm bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 border-2 border-green-200/50 dark:border-green-700/40 rounded-2xl p-4">
              <h3 className="font-bold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                🏆 Más Rentables
              </h3>
              <div className="space-y-2">
                {globalStats.mostProfitable.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 bg-white/60 dark:bg-green-900/30 p-3 rounded-xl"
                  >
                    <span className="text-2xl">{['🥇', '🥈', '🥉'][i]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-green-900 dark:text-green-100 truncate">{r.name}</p>
                      <p className="text-xs text-green-600/70 dark:text-green-400/70">{r.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700 dark:text-green-300">{formatCOP(r.profit)}</p>
                      <p className="text-xs text-green-500/70 dark:text-green-400/70">ganancia</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Más Costosas */}
            <div className="glass-warm bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/20 border-2 border-red-200/50 dark:border-red-700/40 rounded-2xl p-4">
              <h3 className="font-bold text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
                💸 Más Costosas
              </h3>
              <div className="space-y-2">
                {globalStats.mostExpensive.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 bg-white/60 dark:bg-red-900/30 p-3 rounded-xl"
                  >
                    <span className="text-2xl">{['🥇', '🥈', '🥉'][i]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-red-900 dark:text-red-100 truncate">{r.name}</p>
                      <p className="text-xs text-red-600/70 dark:text-red-400/70">{r.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-700 dark:text-red-300">{formatCOP(r.totalCost)}</p>
                      <p className="text-xs text-red-500/70 dark:text-red-400/70">costo</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Más Económicas */}
            <div className="glass-warm bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/20 border-2 border-blue-200/50 dark:border-blue-700/40 rounded-2xl p-4">
              <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                💰 Más Económicas
              </h3>
              <div className="space-y-2">
                {globalStats.cheapest.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 bg-white/60 dark:bg-blue-900/30 p-3 rounded-xl"
                  >
                    <span className="text-2xl">{['1️⃣', '2️⃣', '3️⃣'][i]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-blue-900 dark:text-blue-100 truncate">{r.name}</p>
                      <p className="text-xs text-blue-600/70 dark:text-blue-400/70">{r.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-700 dark:text-blue-300">{formatCOP(r.totalCost)}</p>
                      <p className="text-xs text-blue-500/70 dark:text-blue-400/70">costo</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== TAB: ANÁLISIS DETALLADO ===== */}
      {activeTab === 'analysis' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Selector de receta */}
          <div className="glass-warm bg-cream/90 dark:bg-mocha/60 p-4 rounded-2xl border border-caramel/30">
            <label className="text-sm font-bold mb-3 block text-primary dark:text-vanilla">🔍 Selecciona una receta para análisis detallado</label>
            <select
              value={selectedRecipeId || ''}
              onChange={(e) => setSelectedRecipeId(e.target.value || null)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-emerald-300/50 focus:border-emerald-500 bg-white dark:bg-mocha/40 text-lg font-medium text-primary dark:text-vanilla"
            >
              <option value="">-- Elige una receta --</option>
              {state.recipes.map((r) => (
                <option key={r.id} value={r.id}>{r.name} • {r.category}</option>
              ))}
            </select>
          </div>

          {selectedRecipeAnalysis && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Info de receta */}
              <div className="glass-warm bg-gradient-to-br from-vanilla/95 to-wheat/90 dark:from-mocha/70 dark:to-cocoa/60 p-5 rounded-2xl border border-caramel/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-primary dark:text-vanilla">{selectedRecipeAnalysis.recipe.name}</h3>
                    <p className="text-sm text-mocha/60 dark:text-latte/60">{selectedRecipeAnalysis.recipe.category} • {selectedRecipeAnalysis.recipe.ingredients.length} ingredientes</p>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div className="bg-white/60 dark:bg-mocha/40 px-4 py-2 rounded-xl">
                      <p className="text-xl">🌡️</p>
                      <p className="font-bold text-primary dark:text-vanilla">{selectedRecipeAnalysis.recipe.temperature}°C</p>
                    </div>
                    <div className="bg-white/60 dark:bg-mocha/40 px-4 py-2 rounded-xl">
                      <p className="text-xl">⏱️</p>
                      <p className="font-bold text-primary dark:text-vanilla">{selectedRecipeAnalysis.recipe.time} min</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Métrica de costo */}
              <div className="glass-warm bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 border-2 border-amber-200 dark:border-amber-700/40 rounded-2xl p-6 text-center">
                <p className="text-sm text-amber-600 dark:text-amber-300 font-semibold">📦 Costo Base de la Receta</p>
                <p className="text-4xl font-bold text-amber-700 dark:text-amber-200 mt-2">{formatCOP(selectedRecipeAnalysis.totalCost)}</p>
                <p className="text-xs text-amber-500/70 dark:text-amber-400/70 mt-2">Calculado con precios actuales del inventario</p>
              </div>

              {/* Desglose de ingredientes con gráfico */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card-vintage bg-gradient-to-br from-white to-amber-50/50 dark:from-mocha/80 dark:to-cocoa/70 border-2 border-caramel/30 rounded-2xl p-5">
                  <h4 className="font-bold text-primary dark:text-vanilla mb-4">📊 Distribución de Costos</h4>
                  <DonutChart
                    data={selectedRecipeAnalysis.ingredients.filter(i => i.available).slice(0, 6).map((ing, i) => ({
                      label: ing.name,
                      value: ing.cost,
                      color: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'][i],
                    }))}
                    total={selectedRecipeAnalysis.totalCost}
                    centerLabel={formatCOP(selectedRecipeAnalysis.totalCost)}
                  />
                </div>

                <div className="card-vintage bg-gradient-to-br from-white to-slate-50 dark:from-mocha/80 dark:to-cocoa/70 border-2 border-slate-200/50 dark:border-slate-700/40 rounded-2xl p-5">
                  <h4 className="font-bold text-primary dark:text-vanilla mb-4">📋 Desglose por Ingrediente</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedRecipeAnalysis.ingredients.map((ing, i) => (
                      <div key={ing.name} className={`${!ing.available ? 'opacity-50' : ''}`}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={`flex items-center gap-2 ${ing.available ? 'text-primary dark:text-vanilla' : 'text-red-500'}`}>
                            {ing.available ? '✓' : '✗'} {ing.name}
                            <span className="text-xs text-mocha/50 dark:text-latte/50">({ing.qty} {ing.unit})</span>
                          </span>
                          <span className="font-bold">{ing.available ? formatCOP(ing.cost) : 'Sin precio'}</span>
                        </div>
                        {ing.available && (
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${ing.percent}%` }}
                              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                              transition={{ duration: 0.6, delay: i * 0.05 }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {!selectedRecipeAnalysis && (
            <div className="text-center py-12">
              <span className="text-6xl">🔍</span>
              <h3 className="text-xl font-bold text-mocha/70 dark:text-latte/70 mt-4">Selecciona una receta</h3>
              <p className="text-sm text-mocha/50 dark:text-latte/50">Para ver el análisis detallado de costos</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ===== TAB: SIMULADOR DE PRODUCCIÓN ===== */}
      {activeTab === 'simulator' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Selector y Configuración */}
          <div className="glass-warm bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/30 p-5 rounded-2xl border border-indigo-300/50">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🧮</span>
              <div>
                <h3 className="font-bold text-indigo-800 dark:text-indigo-200 text-lg">Simulador de Producción y Precios</h3>
                <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">Proyecta ganancias ajustando margen y cantidad</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Selector de receta */}
              <div>
                <label className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2 block">📖 Receta</label>
                <select
                  value={simRecipeId || ''}
                  onChange={(e) => setSimRecipeId(e.target.value || null)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-indigo-300/50 focus:border-indigo-500 bg-white dark:bg-indigo-900/30 text-primary dark:text-vanilla"
                >
                  <option value="">-- Selecciona una receta --</option>
                  {state.recipes.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} • {r.category}</option>
                  ))}
                </select>
              </div>

              {/* Margen de ganancia */}
              <div>
                <label className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2 block">📈 Margen de Ganancia: {simMargin}%</label>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={simMargin}
                  onChange={(e) => setSimMargin(Number(e.target.value))}
                  className="w-full h-3 bg-indigo-200 dark:bg-indigo-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-indigo-500/70 dark:text-indigo-400/70 mt-1">
                  <span>0%</span>
                  <span>75%</span>
                  <span>150%</span>
                </div>
              </div>

              {/* Cantidad */}
              <div>
                <label className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2 block">📦 Cantidad a Producir</label>
                <input
                  type="number"
                  value={simQuantity}
                  onChange={(e) => setSimQuantity(Math.max(1, Number(e.target.value)))}
                  min="1"
                  className="w-full px-4 py-3 rounded-xl border-2 border-indigo-300/50 focus:border-indigo-500 bg-white dark:bg-indigo-900/30 text-primary dark:text-vanilla text-center font-bold text-lg"
                />
              </div>
            </div>
          </div>

          {simulatorData ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Info de receta seleccionada */}
              <div className="glass-warm bg-gradient-to-br from-vanilla/95 to-wheat/90 dark:from-mocha/70 dark:to-cocoa/60 p-4 rounded-2xl border border-caramel/30">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{simulatorData.recipe.category === 'Panadería' ? '🍞' : '🍰'}</span>
                  <div>
                    <h3 className="font-bold text-xl text-primary dark:text-vanilla">{simulatorData.recipe.name}</h3>
                    <p className="text-sm text-mocha/60 dark:text-latte/60">{simulatorData.recipe.category} • {simulatorData.recipe.ingredients.length} ingredientes</p>
                  </div>
                </div>
              </div>

              {/* Métricas por Unidad */}
              <div className="grid grid-cols-3 gap-3">
                <div className="glass-warm bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 border-2 border-red-200 dark:border-red-700/40 rounded-2xl p-4 text-center">
                  <p className="text-xs text-red-600 dark:text-red-300 font-semibold">📦 Costo por Unidad</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-200 mt-1">{formatCOP(simulatorData.costPerUnit)}</p>
                </div>
                <div className="glass-warm bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 border-2 border-amber-200 dark:border-amber-700/40 rounded-2xl p-4 text-center">
                  <p className="text-xs text-amber-600 dark:text-amber-300 font-semibold">🏷️ Precio Sugerido</p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-200 mt-1">{formatCOP(simulatorData.pricePerUnit)}</p>
                </div>
                <div className="glass-warm bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 border-2 border-green-200 dark:border-green-700/40 rounded-2xl p-4 text-center">
                  <p className="text-xs text-green-600 dark:text-green-300 font-semibold">💵 Ganancia por Unidad</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-200 mt-1">{formatCOP(simulatorData.profitPerUnit)}</p>
                </div>
              </div>

              {/* Proyección Total */}
              <div className="glass-warm bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 rounded-2xl p-5 shadow-warm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🏭</span>
                  <div>
                    <h3 className="text-white font-bold text-lg">Proyección de Producción</h3>
                    <p className="text-white/70 text-xs">{simQuantity} unidades × {simulatorData.recipe.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <p className="text-white/70 text-xs mb-1">💰 Inversión Total</p>
                    <p className="text-2xl font-bold text-white">{formatCOP(simulatorData.totalInvestment)}</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                    <p className="text-white/70 text-xs mb-1">🏷️ Venta Proyectada</p>
                    <p className="text-2xl font-bold text-white">{formatCOP(simulatorData.totalRevenue)}</p>
                  </div>
                  <div className="bg-white/25 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-white/40">
                    <p className="text-white/80 text-xs mb-1">💵 GANANCIA TOTAL</p>
                    <p className="text-3xl font-bold text-white">{formatCOP(simulatorData.totalProfit)}</p>
                    <p className="text-white/60 text-xs mt-1">Margen {simMargin}%</p>
                  </div>
                </div>
              </div>

              {/* Desglose de ingredientes */}
              <div className="card-vintage bg-gradient-to-br from-white to-slate-50 dark:from-mocha/80 dark:to-cocoa/70 border-2 border-slate-200/50 dark:border-slate-700/40 rounded-2xl p-5">
                <h4 className="font-bold text-primary dark:text-vanilla mb-4">📋 Costo por Ingrediente (x{simQuantity} unidades)</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {simulatorData.ingredients.map((ing) => (
                    <div key={ing.name} className={`flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 ${!ing.available ? 'opacity-50' : ''}`}>
                      <span className={`flex items-center gap-2 text-sm ${ing.available ? 'text-primary dark:text-vanilla' : 'text-red-500'}`}>
                        {ing.available ? '✓' : '✗'} {ing.name}
                        <span className="text-xs text-mocha/50 dark:text-latte/50">({ing.qty * simQuantity} {ing.unit})</span>
                      </span>
                      <span className="font-bold text-sm">{ing.available ? formatCOP(ing.cost * simQuantity) : 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl">🧮</span>
              <h3 className="text-xl font-bold text-mocha/70 dark:text-latte/70 mt-4">Selecciona una receta</h3>
              <p className="text-sm text-mocha/50 dark:text-latte/50">Para simular la producción y calcular ganancias</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ===== TAB: REPORTES ===== */}
      {activeTab === 'reports' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Resumen Ejecutivo */}
          <div className="glass-warm bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800/60 dark:to-slate-700/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-600">
            <h3 className="font-bold text-lg text-primary dark:text-vanilla mb-4 flex items-center gap-2">
              📋 Reporte Ejecutivo - PANCITOS
            </h3>
            <div className="text-xs text-mocha/50 dark:text-latte/50 mb-4">
              Generado: {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl text-center">
                <p className="text-xs text-mocha/60 dark:text-latte/60">Total Recetas</p>
                <p className="text-2xl font-bold text-primary dark:text-vanilla">{globalStats.totalRecipes}</p>
              </div>
              <div className="bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl text-center">
                <p className="text-xs text-mocha/60 dark:text-latte/60">Insumos</p>
                <p className="text-2xl font-bold text-primary dark:text-vanilla">{globalStats.totalItems}</p>
              </div>
              <div className="bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl text-center">
                <p className="text-xs text-mocha/60 dark:text-latte/60">Valor Inventario</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCOP(globalStats.totalInventoryValue)}</p>
              </div>
              <div className="bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl text-center">
                <p className="text-xs text-mocha/60 dark:text-latte/60">Costo Total</p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{formatCOP(globalStats.totalCostAll)}</p>
              </div>
              <div className="bg-green-100/70 dark:bg-green-900/40 p-3 rounded-xl text-center">
                <p className="text-xs text-green-700 dark:text-green-300">Ganancia Total</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCOP(globalStats.totalProfit)}</p>
              </div>
            </div>

            {/* Tabla de Categorías con Ganancias */}
            <h4 className="font-semibold text-primary dark:text-vanilla mb-3">Resumen por Categoría</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 dark:border-slate-600">
                    <th className="text-left py-2 text-mocha/70 dark:text-latte/70 font-semibold">Categoría</th>
                    <th className="text-center py-2 text-mocha/70 dark:text-latte/70 font-semibold">Recetas</th>
                    <th className="text-right py-2 text-mocha/70 dark:text-latte/70 font-semibold">Costo Prom.</th>
                    <th className="text-right py-2 text-mocha/70 dark:text-latte/70 font-semibold">Costo Total</th>
                    <th className="text-right py-2 text-mocha/70 dark:text-latte/70 font-semibold">Ganancia Prom.</th>
                    <th className="text-right py-2 text-mocha/70 dark:text-latte/70 font-semibold">Ganancia Total</th>
                  </tr>
                </thead>
                <tbody>
                  {globalStats.categoryStats.map(cat => (
                    <tr key={cat.category} className="border-b border-slate-100 dark:border-slate-700">
                      <td className="py-2 font-medium text-primary dark:text-vanilla">{cat.category}</td>
                      <td className="py-2 text-center">{cat.count}</td>
                      <td className="py-2 text-right text-amber-600 dark:text-amber-400">{formatCOP(cat.avgCost)}</td>
                      <td className="py-2 text-right text-red-600 dark:text-red-400">{formatCOP(cat.totalCost)}</td>
                      <td className="py-2 text-right text-green-600 dark:text-green-400">{formatCOP(cat.avgProfit)}</td>
                      <td className="py-2 text-right font-bold text-green-700 dark:text-green-300">{formatCOP(cat.totalProfit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumen de Ganancias */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-100/50 to-emerald-100/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">💰 Resumen de Ganancias (Margen {globalStats.defaultMargin}%)</h4>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70">Costo Total</p>
                  <p className="text-lg font-bold text-green-800 dark:text-green-200">{formatCOP(globalStats.totalCostAll)}</p>
                </div>
                <div>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70">Venta Total</p>
                  <p className="text-lg font-bold text-green-800 dark:text-green-200">{formatCOP(globalStats.totalRevenue)}</p>
                </div>
                <div className="bg-green-200/50 dark:bg-green-800/30 rounded-xl p-2">
                  <p className="text-xs text-green-700 dark:text-green-300">Ganancia Total</p>
                  <p className="text-xl font-bold text-green-800 dark:text-green-100">{formatCOP(globalStats.totalProfit)}</p>
                </div>
                <div>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70">Ganancia Prom.</p>
                  <p className="text-lg font-bold text-green-800 dark:text-green-200">{formatCOP(globalStats.avgProfit)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recomendaciones */}
          <div className="glass-warm bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-700">
            <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
              💡 Recomendaciones
            </h3>
            <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
              {globalStats.recipeCosts.some(r => r.completeness < 100) && (
                <li className="flex items-start gap-2">
                  <span>⚠️</span>
                  <span>Hay recetas con ingredientes sin costear. Agrega los insumos faltantes al inventario para mayor precisión.</span>
                </li>
              )}
              {globalStats.mostProfitable[0] && (
                <li className="flex items-start gap-2">
                  <span>🏆</span>
                  <span>La receta más rentable es <strong>{globalStats.mostProfitable[0].name}</strong> con {formatCOP(globalStats.mostProfitable[0].profit)} de ganancia.</span>
                </li>
              )}
              {globalStats.cheapest[0] && (
                <li className="flex items-start gap-2">
                  <span>💰</span>
                  <span>La receta más económica es <strong>{globalStats.cheapest[0].name}</strong> con {formatCOP(globalStats.cheapest[0].totalCost)} de costo.</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span>🧮</span>
                <span>Usa el <strong>Simulador</strong> para calcular precios de venta y proyectar ganancias con diferentes márgenes.</span>
              </li>
            </ul>
          </div>

          {/* Lista de todas las recetas con costos, precios y ganancias */}
          <div className="glass-warm bg-gradient-to-br from-white to-slate-50 dark:from-slate-800/60 dark:to-slate-700/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-600">
            <h3 className="font-bold text-primary dark:text-vanilla mb-4 flex items-center gap-2">
              📖 Detalle por Receta (Margen {globalStats.defaultMargin}%)
            </h3>
            <div className="space-y-2">
              {globalStats.recipeCosts.map((recipe) => (
                <div key={recipe.id} className="flex items-center gap-3 p-3 bg-white/60 dark:bg-slate-900/30 rounded-xl">
                  <span className="text-2xl">{recipe.category === 'Panadería' ? '🍞' : '🍰'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-primary dark:text-vanilla truncate">{recipe.name}</p>
                    <div className="flex items-center gap-2 text-xs text-mocha/50 dark:text-latte/50">
                      <span>{recipe.category}</span>
                      <span>•</span>
                      <span className={recipe.completeness >= 80 ? 'text-green-600' : recipe.completeness >= 50 ? 'text-amber-600' : 'text-red-600'}>
                        {recipe.completeness.toFixed(0)}% costeado
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-right">
                    <div>
                      <p className="text-xs text-red-500/70">Costo</p>
                      <p className="font-bold text-red-600 dark:text-red-400 text-sm">{formatCOP(recipe.totalCost)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-amber-500/70">Precio</p>
                      <p className="font-bold text-amber-600 dark:text-amber-400 text-sm">{formatCOP(recipe.suggestedPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-500/70">Ganancia</p>
                      <p className="font-bold text-green-600 dark:text-green-400 text-sm">{formatCOP(recipe.profit)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ============================================================================
// HOOK RESPONSIVE
// ============================================================================

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// ============================================================================
// DESKTOP NAVBAR SIDEBAR
// ============================================================================

// ============================================================================
// DARK MODE HOOK
// ============================================================================

const useDarkMode = (): [boolean, () => void] => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('pancitos-dark-mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('pancitos-dark-mode', String(isDark));
  }, [isDark]);

  return [isDark, () => setIsDark(prev => !prev)];
};

// ============================================================================
// DESKTOP SIDEBAR
// ============================================================================

const DesktopSidebar: React.FC<{
  user: User;
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}> = ({ user, currentView, onViewChange, onLogout, isDark, onToggleDark }) => {
  const navItems = [
    { id: 'home',       label: 'Inicio',      icon: '🏠', activeColor: 'from-peach to-blush',  border: 'border-peach' },
    { id: 'recipes',    label: 'Recetas',     icon: '📖', activeColor: 'from-caramel to-secondary',  border: 'border-caramel' },
    ...(PERMS.canUseCalculator(user.role) ? [{ id: 'calculator', label: 'Calculadora', icon: '🧮', activeColor: 'from-honey to-caramel', border: 'border-honey' }] : []),
    ...(PERMS.canViewInventory(user.role) ? [{ id: 'inventory', label: 'Inventario',  icon: '🛒', activeColor: 'from-wheat to-latte',   border: 'border-wheat'   }] : []),
    ...(PERMS.canViewCosts(user.role)     ? [{ id: 'costs',     label: 'Costos',      icon: '💰', activeColor: 'from-vanilla to-wheat', border: 'border-vanilla'  }] : []),
  ];

  const roleInfo = ROLE_INFO[user.role];

  const initials = user.username.slice(0,2).toUpperCase();

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-primary via-mocha to-primary dark:from-[#150A06] dark:via-[#1A0D08] dark:to-[#0D0705] border-r border-caramel/20 dark:border-amber-900/30 shadow-warm z-50 flex flex-col transition-colors duration-300"
    >
      {/* App Logo */}
      <div className="px-6 pt-7 pb-5 border-b border-caramel/15">
        <div className="flex items-center gap-3 mb-1">
          <motion.span
            animate={{ y:[0,-5,0] }}
            transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
            className="text-4xl"
          >🥐</motion.span>
          <div>
            <h1 className="text-lg font-bold font-playfair text-vanilla leading-none tracking-wide">PANCITOS</h1>
            <p className="text-[10px] text-peach/60 font-medium tracking-[0.2em] uppercase">Panadería Artesanal</p>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="px-4 py-3 mx-3 mt-4 rounded-2xl glass-warm border border-white/10 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-caramel to-secondary flex items-center justify-center text-flour text-sm font-bold shadow-warm flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-vanilla font-semibold text-sm truncate">{user.username}</p>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-vanilla/80`}>{roleInfo.emoji} {roleInfo.label}</span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        <p className="text-vanilla/30 text-[10px] font-semibold tracking-[0.2em] uppercase px-3 mb-3">Navegación</p>
        {navItems.map((item, idx) => {
          const active = currentView === item.id;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity:0, x:-20 }}
              animate={{ opacity:1, x:0 }}
              transition={{ delay: idx * 0.07 }}
              whileHover={{ x: active ? 0 : 6 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onViewChange(item.id)}
              className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all duration-300 flex items-center gap-3 group relative overflow-hidden ${
                active
                  ? `bg-gradient-to-r ${item.activeColor} text-primary shadow-warm border-l-4 ${item.border}`
                  : 'text-vanilla/60 hover:text-vanilla hover:bg-white/8 border-l-4 border-transparent'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-white/10 rounded-2xl pointer-events-none"
                  transition={{ type:'spring', stiffness:400, damping:30 }}
                />
              )}
              <span className="text-xl relative z-10">{item.icon}</span>
              <span className="font-semibold text-sm relative z-10">{item.label}</span>
              {active && <motion.div animate={{ scale:[1,1.4,1] }} transition={{ duration:2,repeat:Infinity }} className="ml-auto w-2 h-2 bg-primary/40 rounded-full relative z-10" />}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom: dark toggle + logout + version */}
      <div className="px-3 pb-5 border-t border-caramel/15 pt-4 space-y-2">
        <motion.button
          whileHover={{ scale:1.02 }}
          whileTap={{ scale:0.97 }}
          onClick={onToggleDark}
          className="w-full bg-white/8 hover:bg-white/15 text-vanilla/60 hover:text-vanilla px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 font-medium text-sm transition-all border border-white/10"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {isDark ? 'Modo Claro' : 'Modo Oscuro'}
        </motion.button>
        <motion.button
          whileHover={{ scale:1.02 }}
          whileTap={{ scale:0.97 }}
          onClick={onLogout}
          className="w-full bg-blush/20 hover:bg-blush/30 text-blush px-4 py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-all border border-blush/20"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </motion.button>
        <p className="text-center text-vanilla/20 text-[10px] font-medium">v2.0.0 · PANCITOS © 2026</p>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MAIN APP
// ============================================================================

const App: React.FC = () => {
  const state = useAppState();
  const [currentView, setCurrentView] = useState('home');
  const isMobile = useIsMobile();
  const [isDark, toggleDark] = useDarkMode();

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomePage
            user={state.user!}
            stats={{
              recipes: state.recipes.length,
              inventory: state.operations.length,
            }}
            onNavigate={setCurrentView}
          />
        );
      case 'recipes':
        return <RecipesView user={state.user} isMobile={isMobile} />;
      case 'calculator':
        return <CalculatorView />;
      case 'inventory':
        return <InventoryView />;
      case 'costs':
        return <CostsView />;
      default:
        return (
          <HomePage
            user={state.user!}
            stats={{
              recipes: state.recipes.length,
              inventory: state.operations.length,
            }}
            onNavigate={setCurrentView}
          />
        );
    }
  };

  if (!state.user) {
    return <LoginPage onLogin={(user, remember) => {
      state.setUser(user);
      if (remember) state.setRememberMe(true);
    }} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-[#0D0705] via-[#150A06] to-[#1A0D08]' : 'bg-gradient-to-br from-cream via-vanilla to-wheat'}`}>
      {/* Desktop Layout */}
      {!isMobile && (
        <>
          <DesktopSidebar
            user={state.user}
            currentView={currentView}
            onViewChange={setCurrentView}
            onLogout={() => {
              state.setUser(null);
              localStorage.removeItem('pancitos-remember');
            }}
            isDark={isDark}
            onToggleDark={toggleDark}
          />
          {/* Desktop top header */}
          <header className="fixed top-0 left-72 right-0 h-14 glass-warm bg-gradient-to-r from-vanilla/90 to-wheat/85 dark:from-[#1A0D08]/95 dark:to-[#251410]/90 backdrop-blur-xl border-b border-caramel/20 dark:border-amber-800/20 flex items-center px-8 z-40 transition-colors duration-300">
            <div className="flex items-center gap-2 text-primary dark:text-amber-100 font-semibold text-sm">
              {['home','recipes','calculator','inventory','costs'].includes(currentView) && (
                <span className="capitalize">{currentView === 'home' ? '🏠 Inicio' : currentView === 'recipes' ? '📖 Recetas' : currentView === 'calculator' ? '🧮 Calculadora' : currentView === 'inventory' ? '🛒 Inventario' : '💰 Costos'}</span>
              )}
            </div>
            <div className="ml-auto text-xs text-mocha/60 dark:text-amber-200/50 font-medium">PANCITOS · {new Date().toLocaleDateString('es-CR',{weekday:'long',day:'numeric',month:'short'})}</div>
          </header>
          <main className="ml-72 pt-14 p-8">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto"
            >
              {renderView()}
            </motion.div>
          </main>
        </>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <>
          {/* Dark mode toggle - flotante mobile */}
          <motion.button
            className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            style={{
              background: isDark ? 'rgba(218,165,32,0.15)' : 'rgba(91,58,41,0.1)',
              border: isDark ? '1px solid rgba(218,165,32,0.3)' : '1px solid rgba(91,58,41,0.15)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
            onClick={toggleDark}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
          >
            {isDark
              ? <Sun size={18} color="#DAA520" />
              : <Moon size={18} color="#5B3A29" />}
          </motion.button>

          <main className="w-full px-4 py-4 pb-24">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </main>

          <MobileNavbar
            user={state.user}
            currentView={currentView}
            onViewChange={setCurrentView}
            onLogout={() => {
              state.setUser(null);
              localStorage.removeItem('pancitos-remember');
            }}
          />
        </>
      )}
    </div>
  );
};

// ============================================================================
// RENDER
// ============================================================================

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);