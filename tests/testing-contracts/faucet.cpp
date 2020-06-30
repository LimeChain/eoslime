#include <eosio/eosio.hpp>
#include <eosio/symbol.hpp>
#include "eosio.token.cpp"

using namespace eosio;

CONTRACT faucet : public contract
{

public:
	using contract::contract;

	faucet(name receiver, name code, datastream<const char *> ds) : contract(receiver, code, ds),
																	withdrawersTable(receiver, code.value)
	{
	}

	TABLE withdrawer
	{
		uint64_t account;
		asset quantity;
		std::string token_name;
		std::string memo;

		uint64_t primary_key() const { return account; }
		uint64_t balance_key() const { return quantity.amount; }
	};
	typedef eosio::multi_index<"withdrawers"_n, withdrawer, eosio::indexed_by<"bybalance"_n, eosio::const_mem_fun<withdrawer, uint64_t, &withdrawer::balance_key>>> withdrawers;
	withdrawers withdrawersTable;

	ACTION produce(name to, asset quantity, std::string token_name, std::string memo)
	{
		auto withdrawal_itr = withdrawersTable.find(to.value);
		if (withdrawal_itr != withdrawersTable.end())
		{
			withdrawersTable.modify(withdrawal_itr, _self, [&](auto &withdrawal) {
				withdrawal.quantity.amount += quantity.amount;
			});
		}
		else
		{
			withdrawersTable.emplace(_self, [&](auto &new_withdrawal) {
				new_withdrawal.account = to.value;
				new_withdrawal.quantity = quantity;
				new_withdrawal.token_name = token_name;
				new_withdrawal.memo = memo;
			});
		}
	}

	ACTION withdraw(name withdrawer)
	{
		// Inline action (Call token contract)
		for (auto &currentWithdrawer : withdrawersTable)
		{
			if (currentWithdrawer.account == withdrawer.value)
			{
				token::issue_action issue(currentWithdrawer.token_name, {get_self(), "active"_n});
				issue.send(withdrawer, currentWithdrawer.quantity, currentWithdrawer.memo);
			}
		}
	}

	ACTION test() {}
};