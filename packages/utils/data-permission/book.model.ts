// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at

//   http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { DataTypes, Model } from 'sequelize';
import { sequelize } from './sequelize-setup';

class Book extends Model {
    public id!: number;
    public title!: string;
    public author!: string;
    public publisher!: string;
    public publishDate!: Date;
    public price!: number;
    public categoryId!: number;
}

Book.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: DataTypes.STRING,
        author: DataTypes.STRING,
        publisher: DataTypes.STRING,
        publishDate: DataTypes.DATE,
        price: DataTypes.FLOAT,
        categoryId: DataTypes.INTEGER,
    },
    {
        tableName: 'books',
        sequelize,
        underscored: true,
    }
);

export { Book };
