'use strict';

const { Contract } = require('fabric-contract-api');

class PatientContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const patients = [];
        for (let i = 0; i < patients.length; i++) {
            await ctx.stub.putState('PATIENT' + i, Buffer.from(JSON.stringify(patients[i])));
            console.info('Added <--> ', patients[i]);
        }

        const bilans = [];
        for (let i = 0; i < bilans.length; i++) {
            await ctx.stub.putState('BILAN' + i, Buffer.from(JSON.stringify(bilans[i])));
            console.info('Added <--> ', bilans[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async createPatient(ctx, nin, firstName, lastName, dateOfBirth, sex, motherNin, fatherNin, familyMedicalHistory, allergy, chronicIllnesses, amendedFrom) {
        console.info('============= START : Create Patient ===========');

        const patient = {
            nin,
            firstName,
            lastName,
            dateOfBirth,
            sex,
            motherNin,
            fatherNin,
            familyMedicalHistory,
            allergy,
            chronicIllnesses,
            amendedFrom,
        };

        await ctx.stub.putState(nin, Buffer.from(JSON.stringify(patient)));
        console.info('============= END : Create Patient ===========');
    }

    async queryPatient(ctx, nin) {
        const patientAsBytes = await ctx.stub.getState(nin);
        if (!patientAsBytes || patientAsBytes.length === 0) {
            throw new Error(`${nin} does not exist`);
        }
        console.log(patientAsBytes.toString());
        return patientAsBytes.toString();
    }

    async queryAllPatients(ctx) {
        const startKey = '';
        const endKey = '';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                return JSON.stringify(allResults);
            }
        }
    }

    async createBilan(ctx, bilanId, patientNin, date, details) {
        console.info('============= START : Create Bilan ===========');

        const bilan = {
            bilanId,
            patientNin,
            date,
            details,
        };

        await ctx.stub.putState(bilanId, Buffer.from(JSON.stringify(bilan)));
        console.info('============= END : Create Bilan ===========');
    }

    async queryBilan(ctx, bilanId) {
        const bilanAsBytes = await ctx.stub.getState(bilanId);
        if (!bilanAsBytes || bilanAsBytes.length === 0) {
            throw new Error(`${bilanId} does not exist`);
        }
        console.log(bilanAsBytes.toString());
        return bilanAsBytes.toString();
    }

    async queryBilansByPatient(ctx, patientNin) {
        const queryString = {};
        queryString.selector = {};
        queryString.selector.patientNin = patientNin;

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                return JSON.stringify(allResults);
            }
        }
    }
}

module.exports = PatientContract;
