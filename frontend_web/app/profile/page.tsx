import React from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Profile = () => {
    return (
        <div className="min-h-screen p-4 w-full flex items-center flex-col">
            {/* Header */}
            <div className="flex self-start items-center gap-4 mb-6">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="text-gray-700 hover:bg-white/50">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <div className="flex gap-3">
                    <div className="p-2 rounded-full bg-white shadow-md">
                        <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-medium text-gray-800">Cool Dawg</h1>
                        <p className="text-sm text-gray-500">6/9/1999</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid grid-cols-2 w-full bg-white/50 backdrop-blur-sm border border-gray-100 rounded-xl mb-6">
                    <TabsTrigger
                        value="personal"
                        className="flex-1 data-[state=active]:bg-white data-[state=active]:text-primary rounded-lg"
                    >
                        Personal
                    </TabsTrigger>
                    <TabsTrigger
                        value="medical"
                        className="flex-1 data-[state=active]:bg-white data-[state=active]:text-primary rounded-lg"
                    >
                        Medical
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4 animate-fade-in w-full">
                    <div className="space-y-3 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm w-full">
                        <InfoItem label="Gender" value="Female" />
                        <InfoItem label="Weight" value="50kg" />
                        <InfoItem label="Height" value="5'10ft" />
                        <InfoItem label="Address" value="De La Salle University Manila Taft Avenue, 1600" />
                        <InfoItem label="Phone no." value="09170917917" />
                        <InfoItem label="Languages" value="English, Filipino" />
                    </div>
                </TabsContent>

                <TabsContent value="medical" className="space-y-4 animate-fade-in w-full">
                    <div className="space-y-4 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm w-full">
                        <InfoItem label="Blood Type" value="O+" />

                        <div>
                            <h3 className="text-gray-500 font-medium mb-2">Allergies & Reactions</h3>
                            <ul className="space-y-2">
                                <ListItem title="Aspirin" details={["Swelling of the skin"]} />
                                <ListItem title="Wasp" details={["Difficulty breathing"]} />
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-gray-500 font-medium mb-2">Medicines</h3>
                            <ul className="space-y-1">
                                <ListItem title="Nitro derivatives" />
                                <ListItem title="Antidepressants" />
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-gray-500 font-medium mb-2">Emergency Contacts</h3>
                            <ul className="space-y-2">
                                <ListItem
                                    title="Your Mom"
                                    details={["Mother", "09170917917"]}
                                />
                            </ul>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <div>
        <h3 className="text-gray-500 font-medium mb-1">{label}</h3>
        <p className="text-gray-800">{value}</p>
    </div>
);

const ListItem = ({ title, details = [] }: { title: string; details?: string[] }) => (
    <li className="bg-white/50 rounded-lg p-3">
        <p className="text-gray-800">• {title}</p>
        {details.length > 0 && (
            <ul className="mt-1 pl-4">
                {details.map((detail, index) => (
                    <li key={index} className="text-gray-500 text-sm">- {detail}</li>
                ))}
            </ul>
        )}
    </li>
);

export default Profile;